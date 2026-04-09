# Configuration options

In this chapter, I will go over the configuration options – not necessarily all at once, but gradually, focusing first on the most important or less straightforward ones.

## Dongle Mode

Dongle Mode is a special mode introduced by Google for wireless Android Auto adapters such as the MA1. It allows Android Auto to start without requiring the dongle itself to support Bluetooth Hands-Free profiles (HFP/HSP).

How it works
- Android Auto checks the name of the Bluetooth device.
- If the device name matches the pattern `AndroidAuto-xxx`, the connection is accepted even if the dongle does not expose a hands-free profile.
- The system then binds the car’s hands-free connection to the dongle’s MAC address.
- As a result, Android Auto will only start when the phone is connected to the car’s Bluetooth hands-free system.

This mechanism is designed to prevent Android Auto from launching automatically in cars where the USB port remains powered even when the ignition is off.

### Limitations

Dongle Mode is not a perfect solution. The dongle will still continuously attempt to connect to the phone, which may result in persistent notifications such as:

`Looking for Android Auto`

However, Android Auto itself will not start until the phone is connected to the car’s Bluetooth system.
