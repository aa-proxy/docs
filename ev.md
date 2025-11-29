# EV Routing Feature Overview

Our project is the first to introduce a unique capability: enhancing EV navigation in older electric cars whose manufacturers have long stopped updating - or never intended to update - their onboard software.
We refer to this functionality as the Google Maps EV Routing feature. Google introduced EV routing at [CES 2024](https://blog.google/products/android/android-auto-new-features-ces24/), and the first cars officially supporting it through Android Auto were the Ford Mustang Mach-E and the F-150 Lightning.

Thanks to the power of open source, even older EVs can now benefit from modern features and a much better navigation experience!

A demonstration of how this works in a real car can be found here:
https://youtu.be/M1qf9Psu6g8

The idea of enabling this feature on additional EV models began in [issue #19](https://github.com/aa-proxy/aa-proxy-rs/issues/19) in February 2025. After a long search for someone with the required hardware and expertise to capture the necessary logs, we finally obtained sample data at the end of June 2025 - thanks to [@SquidBytes](https://github.com/SquidBytes).

After many hours of work by [@Deadknight](https://github.com/Deadknight) and [@gamelaster](https://github.com/gamelaster), we were able to extract and utilize the critical information needed to make the feature functional.

## How It Works

In simple terms, the goal is to obtain live vehicle data - primarily battery state of charge and optional outside temperature - and feed it into aa-proxy-rs.
Once aa-proxy-rs has access to this data, it forwards it to Google Maps, enabling EV-specific route planning with charger recommendations.

For most EVs, the most practical way to obtain such data is through the vehicle’s OBD port.

### Built-in REST Interface

aa-proxy-rs includes an embedded REST server that can accept battery data from any source.
(For example, I personally use a slightly modified version of the [canze-rs](https://github.com/manio/canze-rs) app running on the same device as aa-proxy-rs, which connects wirelessly to a Bluetooth OBD dongle.)

aa-proxy-rs can also be configured to automatically start a data-collection tool or client whenever Android Auto connects and battery data is needed. When the AA session ends, the tool is automatically terminated.
The executable can be configured in config.toml and is launched with the relevant arguments.

## The Challenge: OBD Data Is Not Standardized

The biggest issue with OBD-based solutions is that OBD data is not standardized between manufacturers.
Each EV model uses its own set of PIDs-identifiers for CAN bus registers where battery or temperature data can be read.

This is where WiCAN devices are extremely helpful, as they provide access to a PID database.
Thanks to this, [@juggie](https://github.com/juggie) created a dedicated client:

🔗 aa-proxy-rs client for WiCAN Pro  
https://github.com/aa-proxy/aa-proxy-wican

This tool handles transferring WiCAN data to aa-proxy-rs. Please refer to the [project's README](https://github.com/aa-proxy/aa-proxy-wican/blob/main/README.md) page for more details.

There is also a wired OBD client for ELM327 dongles:

🔗 EV OBD Feeder for aa-proxy-rs  
https://github.com/aa-proxy/aa-proxy-go-obd-feeder

It can also be adapted to work with Bluetooth versions of the ELM327.

If you're not sure what to do, I encourage you to join our [Discord](https://discord.gg/c7JKdwHyZu). With some teamwork we might be able to add support for your case - plus there are quite a few people there, and someone might already have the exact same car as you.

## Vehicle Model Configuration

Once live battery data is being delivered correctly, the second half of the setup is required.

Each EV has completely different parameters: battery capacity, weight, drag coefficient, and many other characteristics.
These parameters form the vehicle model. By default, aa-proxy-rs includes an F-150 model, which naturally leads to incorrect range estimates for other cars.

aa-proxy-rs expects your car model file located by default at:  
_/etc/aa-proxy-rs/ev_model.bin_


This is a binary protobuf file containing the EV model that is passed to Google Maps.

Thanks to [@Deadknight](https://github.com/Deadknight), we now have a website and an Android APK that greatly simplify generating such model files:

⚙️ EV Model Generator for MITM Mode  
http://152.70.21.153/index.php

🤖 Android Companion App  
http://152.70.21.153/app-151120251405.zip

Using these tools, you can create a model tailored to your specific EV, ensuring accurate range predictions and optimal routing.

## Final Notes

As you can see, enabling EV routing is a fairly complex process.
It is not a plug-and-play feature-you will likely need to experiment, adjust settings, and fine-tune both data sources and the EV model.

But once everything is configured and working, the experience brings a lot of joy and massively improves everyday use of older electric vehicles.
