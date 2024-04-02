# CHANGELOG

## [1.2.2]

- Connection page will now show errors and has form validation. Additionally, the connection page will now show when it's trying to initiate a connection.

## [1.2.1]

- Added auto updating.

## [1.2.0]

- Added the ability to publish messages to an Exchange.
- Added notification dot to indicate when a non-visible queue/exchange has an unread message.
- Some minor UI improvements.

## [1.1.0]

- Added the ability to hide Exchanges from the Exchange list.
- Fixed Boolean values not being used for `true` and `false` in the queue routing options.
- Improved message loading by storing messages in the main process and requesting them from rendering when queues change. This should speed up message retrieval time, and give history as long as the client hasn't been closed.
- Added Copy button to message body and message headers.
- Added the ability to sort messages in the message list by timestamp.

## [1.0.0]

Initial public release.
