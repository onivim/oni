- Remove oni-plugin-npm-tasks

- Refactor package.json
- Use `subscriptions`
- Use `fileTypes`
- Use `commands`

- Make easier to add `activationEvents` and sidestep the mess in `PackageCapabilitiesParser`

- Log plugin activation
- Start with wildcard activation

- Pass an `activate` delegate into `createPluginChannel`

- `activationMode`
    - `immediate`
    - `on-demand`

- Default - on-demand
