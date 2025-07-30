import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
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

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) => initProcess());
  }

  Future<void> initProcess() async {
    if (await requestLocationPermission()) {
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

      PermissionStatus permission = await location.hasPermission();
      if (permission == PermissionStatus.denied) {
        permission = await location.requestPermission();
      }

      if (permission != PermissionStatus.granted) {
        setState(() => status = "❌ Location permission denied");
        return false;
      }

      return true;
    } on PlatformException catch (e) {
      print("❌ SERVICE_STATUS_ERROR: ${e.message}");
      if (e.code == "SERVICE_STATUS_ERROR") {
        setState(() => status = "⚠️ Please manually enable location services.");
      } else {
        setState(() => status = "❌ Location service error: ${e.message}");
      }
      return false;
    } catch (e) {
      print("❌ General location error: $e");
      setState(() => status = "❌ Unexpected error: $e");
      return false;
    }
  }


  void connectToSocket() {
    socket = IO.io(
      'http://10.0.2.2:3000', // Use your backend IP or localhost for emulator
      IO.OptionBuilder().setTransports(['websocket']).build(),
    );

    socket!.onConnect((_) {
      print("✅ Socket connected: ${socket!.id}");
      setState(() => status = "✅ Connected to Server");
      startLocationUpdates();
    });

    socket!.onDisconnect((_) {
      print("🔌 Socket disconnected");
      setState(() => status = "🔌 Disconnected from Server");
    });

    socket!.onConnectError((err) {
      print("❌ Socket connect error: $err");
      setState(() => status = "❌ Socket connect error");
    });

    socket!.on("delivery_request", (data) {
      print("📦 Delivery Request Received: $data");
      playNotificationSound();
      if (!isDialogVisible) {
        showOrderDialog(data);
      }
    });
  }

  void startLocationUpdates() {
    locationTimer = Timer.periodic(Duration(seconds: 10), (_) => sendCurrentLocation());
    sendCurrentLocation(); // Send immediately
  }

  Future<void> sendCurrentLocation() async {
    try {
      final currentLocation = await location.getLocation();
      final lat = currentLocation.latitude;
      final lon = currentLocation.longitude;

      if (lat != null && lon != null && socket?.connected == true) {
        socket!.emit('locationUpdate', {'latitude': lat, 'longitude': lon});
        print("📡 Sent location: $lat, $lon");
        setState(() => status = "📡 Sent: $lat, $lon");
      } else {
        print("⚠️ Could not send location");
        setState(() => status = "⚠️ Could not send location");
      }
    } catch (e) {
      print("❌ Location error: $e");
      setState(() => status = "❌ Failed to get/send location");
    }
  }

  void playNotificationSound() async {
    try {
      await _audioPlayer.stop(); // Stop previous sound
      await _audioPlayer.play(AssetSource('sounds/notification.mp3'));
    } catch (e) {
      print("❌ Audio play error: $e");
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
    appBar: AppBar(title: Text('Delivery Partner')),
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
