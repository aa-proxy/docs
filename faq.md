# Frequently Asked Questions (FAQ)

## Is there a donation link or a "Buy Me a Coffee" page where I can support this project?

No, and I don't plan to add one. This project was created in the spirit of open source, and I'd like to keep it that way. I know accepting donations doesn't conflict with that philosophy, but personally I've been benefiting from open-source software for decades - I've been using Linux since 1999. So I'd rather consider this project my small contribution back to the FOSS community. 🙂

## The connection keeps restarting: connect, disconnect, connect, disconnect...

This is intentional behavior. Imagine that I connect once and, even if no data is received, I simply stop trying. That would cause everything to eventually come to a halt. Errors happen - sometimes the phone won't connect, sometimes the HU doesn't respond in time, etc.

I need to periodically attempt to restart the connection; otherwise, the whole system would not be able to recover from an error.

If, during the initial startup, it looks like the entire AA session keeps restarting constantly, there is most likely some underlying problem. For example, the HU may not be responding in time, so after the configured timeout, `aa-proxy-rs` drops the connection and starts the whole process over again.
