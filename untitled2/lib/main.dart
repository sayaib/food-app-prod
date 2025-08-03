import 'dart:async';
import 'dart:io';

import 'package:flutter/material.dart';
import 'package:location/location.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:audioplayers/audioplayers.dart';

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

  final String deliveryPartnerId = "partner_123"; // ✅ Custom ID to be sent

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => initProcess());
  }

  Future<void> initProcess() async {
    setState(() => status = "🔄 Checking location permission...");
    bool granted = await requestLocationPermission();

    if (granted) {
      connectToSocket();
    } else {
      setState(() => status =
      "❌ Location permission not granted. Please allow location.");
      Future.delayed(Duration(seconds: 3), () {
        initProcess(); // Retry
      });
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
    final String? baseUrl =
    Platform.isAndroid ? "http://10.0.2.2:5050" : "http://10.52.0.243:5050";

    socket = IO.io(
      baseUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .setQuery({'partnerId': deliveryPartnerId}) // ✅ Send custom ID
          .build(),
    );

    socket!.onConnect((_) {
      debugPrint("✅ Connected to server as $deliveryPartnerId");
      setState(() => status = "✅ Connected as $deliveryPartnerId");
      startLocationUpdates();
    });

    socket!.onDisconnect((_) {
      debugPrint("🔌 Disconnected");
      setState(() => status = "🔌 Disconnected from server");
    });

    socket!.onConnectError((err) {
      debugPrint("❌ Socket connection error: $err");
      setState(() => status = "❌ Socket connection error");
    });

    socket!.on("delivery_request", (data) {
      debugPrint("📦 Delivery Request: $data");
      playNotificationSound();
      if (!isDialogVisible) showOrderDialog(data);
    });
  }

  void startLocationUpdates() {
    debugPrint("📍 Starting location updates");

    sendCurrentLocation();

    locationTimer = Timer.periodic(Duration(seconds: 30), (_) {
      sendCurrentLocation();
    });
  }

  Future<void> sendCurrentLocation() async {
    try {
      final current = await location.getLocation();
      double? lat = current.latitude;
      double? lon = current.longitude;

      if ((lat == null || lon == null) && Platform.isIOS) {
        lat = 37.7749;
        lon = -122.4194;
        debugPrint("⚠️ Using fallback iOS simulator location");
      }

      if (lat != null && lon != null && socket?.connected == true) {
        socket!.emit("locationUpdate", {
          'latitude': lat,
          'longitude': lon,
          'partnerId': deliveryPartnerId,
        });
        setState(() => status = "📡 Sent location: $lat, $lon");
        debugPrint("✅ Sent location: $lat, $lon");
      } else {
        setState(() => status = "⚠️ Could not send location");
        debugPrint("⚠️ Missing location or socket");
      }
    } catch (e) {
      debugPrint("❌ Error sending location: $e");
      setState(() => status = "❌ Location error");
    }
  }

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
                "partnerId": deliveryPartnerId,
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
