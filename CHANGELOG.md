# CHANGELOG

## [1.2.0]

New Features:

- Added the ability to publish messages to an Exchange.

## [1.1.0]

New Features:

- Added the ability to hide Exchanges from the Exchange list.
- Fixed Boolean values not being used for `true` and `false` in the queue routing options.
- Improved message loading by storing messages in the main process and requesting them from rendering when queues change. This should speed up message retrieval time, and give history as long as the client hasn't been closed.
- Added Copy button to message body and message headers.
- Added the ability to sort messages in the message list by timestamp.
