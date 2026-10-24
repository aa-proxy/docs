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

## Video overlay: hardware acceleration

`aa-proxy-rs` can draw text on top of the Android Auto video (the *video overlay*). The overlay itself, all its options and the software mode are described in the [main README](https://github.com/aa-proxy/aa-proxy-rs#video-overlay). Here I only describe what you need to build to use the **hardware** H.264 decoder/encoder (`overlay_hw_accel = "auto"`) on a Raspberry Pi.

The official `aa-proxy-rs` image is a general purpose one, and I do not want to burden it with things that not everybody needs: the V4L2 codec drivers and tools are **not** included in it. To use the hardware acceleration on a Raspberry Pi you have to build your own image with Buildroot (see the [aa-proxy buildroot](https://github.com/aa-proxy/buildroot) repository) and add the following.

Supported boards: Raspberry Pi 3, Raspberry Pi 4 and Raspberry Pi Zero 2 W (the `bcm2835-codec` driver). The Raspberry Pi 5 is **not** supported, it has no hardware H.264 encoder. If the hardware is not available, `aa-proxy-rs` automatically falls back to the software codec.

### Kernel config

Add to the kernel configuration fragment:

```
# Enable V4L2 media support and built-in hardware H.264 decoding (bcm2835-codec)
CONFIG_STAGING=y
CONFIG_MEDIA_SUPPORT=y
CONFIG_MEDIA_SUPPORT_FILTER=y
CONFIG_MEDIA_CONTROLLER=y
CONFIG_VIDEO_DEV=y
CONFIG_V4L2_MEM2MEM_DEV=y
CONFIG_RASPBERRYPI_FIRMWARE=y
CONFIG_BCM2835_VCHIQ=y
CONFIG_BCM2835_VCHIQ_MMAL=y
CONFIG_VIDEO_CODEC_BCM2835=y
CONFIG_VIDEO_BCM2835_ISP=n
CONFIG_DMA_SHARED_BUFFER=y
CONFIG_VIDEOBUF2_CORE=y
CONFIG_VIDEOBUF2_V4L2=y
CONFIG_VIDEOBUF2_MEMOPS=y
CONFIG_VIDEOBUF2_DMA_CONTIG=y
CONFIG_VIDEOBUF2_VMALLOC=y
```

### Buildroot defconfig

The V4L2 utilities are handy for checking the devices:

```
BR2_PACKAGE_LIBV4L=y
BR2_PACKAGE_LIBV4L_UTILS=y
```

### Load the driver at boot

Add the following line to `/etc/init.d/S00modules`:

```
modprobe bcm2835_codec
```

### config.txt

On the boot partition (memory reserved for the GPU/VPU):

```
gpu_mem=128
```

### Checking and enabling

After booting the new image, check that the codec devices exist (usually the decoder is `/dev/video10` and the encoder `/dev/video11`):

```sh
ls -l /dev/video10 /dev/video11
v4l2-ctl --list-devices
```

Then enable it in `config.toml`:

```toml
overlay_enabled = true
overlay_hw_accel = "auto"
```

The log tells whether the hardware codecs were found (`V4L2 M2M hardware acceleration enabled`) or the software pipeline is used.

## A2DP Sink: keep the car's Bluetooth media audio untouched

By default, when Android Auto starts, the phone switches its Bluetooth audio into a "car kit" (HFP-only) mode and the head unit's own Bluetooth **Media Audio** (A2DP) connection with the phone gets disabled. If you want to keep listening to the car's Bluetooth media (and, for example, let music apps keep updating live lyrics through the A2DP endpoint) while Android Auto is running, enable the `bt_a2dp_sink_enabled` option.

```toml
bt_a2dp_sink_enabled = false # default
```

What it does
- Registers a dummy **A2DP Audio Sink** SDP profile on the local Bluetooth adapter (via BlueZ `ProfileManager1`), so the phone sees A2DP as available.
- Strips the `BluetoothService` entry from the `service discovery response`, so Android Auto does not lock the session into Car-Kit/HFP-only audio routing.
- As a result the vehicle's own Bluetooth media audio session stays untouched, while Android Auto voice/media still routes through the proxy.

::: warning
No audio is actually streamed through this A2DP profile: only the SDP record is advertised. The option is ignored in [Dongle Mode](#dongle-mode) and is marked as *advanced* in the web interface.
:::

### BlueZ `main.conf`

In the setup where this feature was first reported and tested (see [issue #126](https://github.com/aa-proxy/aa-proxy-rs/issues/126)) the following was also set in `/etc/bluetooth/main.conf`, in the `[General]` section:

```ini
[General]
Class = 0x200414
Enable = Source,Sink,Media,Socket
JustWorksRepairing = always
DeviceID = false
```

These values come from a community report. Try `bt_a2dp_sink_enabled` first without touching `main.conf`, and only change it if the phone still disables the car's Media Audio. Restart `bluetoothd` (or reboot) after editing the file. If you build your own image, put the file into the rootfs overlay.

### Troubleshooting
- Check the log (`/var/log/aa-proxy-rs.log`) for `A2DP Sink SDP profile registered` – if you see `registration failed` instead, `bluetoothd` is probably not reachable over the system D-Bus.
- After enabling the option, forget the **aa-proxy** device on the phone and pair again, so the phone refreshes the cached SDP records.
