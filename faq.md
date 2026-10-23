# Frequently Asked Questions (FAQ)

## Is there a donation link or a "Buy Me a Coffee" page where I can support this project?

No, and I don't plan to add one. This project was created in the spirit of open source, and I'd like to keep it that way. I know accepting donations doesn't conflict with that philosophy, but personally I've been benefiting from open-source software for decades - I've been using Linux since 1999. So I'd rather consider this project my small contribution back to the FOSS community. 🙂

## The connection keeps restarting: connect, disconnect, connect, disconnect...

This is intentional behavior. Imagine that I connect once and, even if no data is received, I simply stop trying. That would cause everything to eventually come to a halt. Errors happen - sometimes the phone won't connect, sometimes the HU doesn't respond in time, etc.

I need to periodically attempt to restart the connection; otherwise, the whole system would not be able to recover from an error.

If, during the initial startup, it looks like the entire AA session keeps restarting constantly, there is most likely some underlying problem. For example, the HU may not be responding in time, so after the configured timeout, `aa-proxy-rs` drops the connection and starts the whole process over again.

## Can I run aa-proxy-rs on Windows for wired DHU connections?

Yes, it has been reported to work, but Windows may not automatically recognize the phone's USB interface. If the device is not detected, manually install the [Google USB Driver](https://developer.android.com/studio/run/win-usb) and select **Android Composite ADB Interface** for the device with hardware ID `VID_18D1` / `PID_2D01`.

Note that Windows may require the driver to be installed again after disconnecting and reconnecting the device. Modifying the driver's INF file to include this hardware ID may help resolve the issue permanently.

## Are there any plans to support Apple CarPlay or CarPlay Ultra?

aa-proxy is designed for Android Auto, and Apple CarPlay is a completely different beast that would likely require a separate project.

While the recent reverse engineering efforts and leaked MFi 3.0 certificates have sparked interest in CarPlay-related projects, adding support for CarPlay Ultra features, such as vehicle climate controls, is outside the scope of aa-proxy.

I personally have no plans to work on this, as I don't own any Apple hardware and have no plans to get any. Anyone interested in bringing these capabilities to CarPlay is welcome to explore the idea as a separate project.
