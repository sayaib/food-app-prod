import 'dart:async';
import 'package:flutter/material.dart';
import 'package:location/location.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:audioplayers/audioplayers.dart';
import 'dart:io';
import 'package:http/http.dart' as http;


void main() => runApp(MyApp());

class MyApp extends StatelessWidget {
  @override
  Widget build(BuildContext context) => MaterialApp(
    title: 'Delivery Partner App',
    theme: ThemeData(primarySwatch: Colors.green),
    home: DeliveryPartnerScreen(),
  );
}

class DeliveryPartnerScreen extends StatefulWidget {
  @override
  _DeliveryPartnerScreenState createState() => _DeliveryPartnerScreenState();
}

class _DeliveryPartnerScreenState extends State<DeliveryPartnerScreen> {
  final Location location = Location();
  final AudioPlayer _audioPlayer = AudioPlayer();
  IO.Socket? socket;
  Timer? locationTimer;
  String status = "🔄 Initializing...";
  bool isDialogVisible = false;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => initProcess());
  }

  Future<void> initProcess() async {
    bool locationGranted = await requestLocationPermission();
    debugPrint("Location permission? $locationGranted");

    if (!locationGranted) {
      setState(() => status = "❌ Location permission not granted");
    } else {
      connectToSocket();
    }
  }

  Future<bool> requestLocationPermission() async {
    try {
      bool serviceEnabled = await location.serviceEnabled();
      if (!serviceEnabled) {
        serviceEnabled = await location.requestService();
      }
      if (!serviceEnabled) {
        setState(() => status = "❌ Location service not enabled");
        return false;
      }

      var permission = await location.hasPermission();
      if (permission == PermissionStatus.denied) {
        permission = await location.requestPermission();
      }
      if (permission != PermissionStatus.granted) {
        setState(() => status = "❌ Location permission denied");
        return false;
      }
      return true;
    } catch (e) {
      debugPrint("❌ Location permission error: $e");
      return false;
    }
  }

  void connectToSocket() {
    final String? baseUrl = Platform.isAndroid
        ? "http://10.0.2.2:3000"
        : "http://10.52.0.243:3000";
    socket = IO.io(
      baseUrl,
      IO.OptionBuilder().setTransports(['websocket']).build(),
    );

    socket!.onConnect((_) {
      debugPrint("✅ Connected to server: ${socket!.id}");
      setState(() => status = "✅ Connected to Server");

      startLocationUpdates();
    });

    socket!.onDisconnect((_) {
      debugPrint("🔌 Disconnected from server");
      setState(() => status = "🔌 Disconnected from Server");
    });

    socket!.onConnectError((err) {
      debugPrint("❌ Socket connect error: $err");
      setState(() => status = "❌ Socket connection error");
    });

    socket!.on("delivery_request", (data) {
      debugPrint("📦 Delivery Request: $data");
      playNotificationSound();
      if (!isDialogVisible) showOrderDialog(data);
    });
  }

  void startLocationUpdates() {
    print("📍 Starting location updates");

    // Immediately send the first location update
    sendCurrentLocation().catchError((e) {

      debugPrint("❌ Error in initial location send: $e");
    });

    // Start periodic updates
    locationTimer = Timer.periodic(Duration(seconds: 10), (_) async {
      try {

        await sendCurrentLocation();


      } catch (e) {
        print(e);
        debugPrint("❌ Error in periodic location update: $e");
      }
    });
  }
  Future<void> sendCurrentLocation() async {
    try {
      debugPrint("📡 Getting current location...");
      final current = await location.getLocation();
      debugPrint("📡 Raw location object: $current");

      double? lat = current.latitude;
      double? lon = current.longitude;

      debugPrint("📡 Parsed: latitude=$lat, longitude=$lon");

      // For iOS simulator fallback
      if ((lat == null || lon == null) && Platform.isIOS) {
        lat = 37.7749;
        lon = -122.4194;
        debugPrint("⚠️ Using fallback location for iOS simulator");
      }

      if (lat != null && lon != null && socket?.connected == true) {
        socket!.emit("locationUpdate", {'latitude': lat, 'longitude': lon});
        debugPrint("✅ Sent location to server: $lat, $lon");
        setState(() => status = "📡 Location: $lat, $lon");
      } else {
        debugPrint("⚠️ Location not sent: lat/lon/socket missing");
        setState(() => status = "⚠️ Location not sent");
      }
    } catch (e, stack) {
      debugPrint("❌ Error getting location: $e");
      debugPrint(stack.toString());
      setState(() => status = "❌ Location error");
    }
  }


  //
  // Future<void> sendCurrentLocation() async {
  //   try {
  //     final current = await location.getLocation();
  //     final lat = current.latitude;
  //     final lon = current.longitude;
  //     print("${lat},${lon}");
  //     if (lat != null && lon != null && socket?.connected == true) {
  //       print("${lat},${lon}");
  //       socket!.emit("locationUpdate", {'latitude': "lat", 'longitude': "lon"});
  //       debugPrint("📡 Sent location: $lat, $lon");
  //       setState(() => status = "📡 Location: $lat, $lon");
  //     } else {
  //       setState(() => status = "⚠️ Location not sent");
  //     }
  //   } catch (e) {
  //     print(e);
  //     debugPrint("❌ Error sending location: $e");
  //     setState(() => status = "❌ Location error");
  //   }
  // }

  Future<void> playNotificationSound() async {
    try {
      await _audioPlayer.stop();
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      debugPrint("❌ Audio error: $e");
    }
  }

  void showOrderDialog(dynamic orderData) {
    isDialogVisible = true;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (_) => AlertDialog(
        title: Text("🛵 New Delivery Request"),
        content: Text(
          "Restaurant: ${orderData['restaurant']}\n"
              "Address: ${orderData['address']}\n"
              "Amount: ₹${orderData['amount']}",
        ),
        actions: [
          TextButton(
            onPressed: () {
              socket?.emit("accept_order", {
                "orderId": orderData["orderId"],
                "partnerId": socket?.id,
              });
              Navigator.of(context).pop();
              isDialogVisible = false;
              setState(() => status = "✅ Order Accepted");
            },
            child: Text("✅ Accept"),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              isDialogVisible = false;
              setState(() => status = "❌ Order Rejected");
            },
            child: Text("❌ Reject"),
          ),
        ],
      ),
    );
  }

  @override
  void dispose() {
    locationTimer?.cancel();
    socket?.disconnect();
    socket?.dispose();
    _audioPlayer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => Scaffold(
    appBar: AppBar(title: Text("Delivery Partner")),
    body: Center(
      child: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Text(
          status,
          textAlign: TextAlign.center,
          style: TextStyle(fontSize: 18),
        ),
      ),
    ),
  );
}
