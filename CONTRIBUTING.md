# ONI Contribution Guide

- [Debugging](#debugging)
    - [Debug build](#debug-build)
    - [Production build](#production-build)
    - [Hot-reload build](#hot-reload-build)

# Debugging

## Debug build

In order to build a source-map enabled build, you can do the following:

- `npm run build-debug`
- `npm link` (only needed the first time)
- `oni`

Debugging in [VSCode](https://github.com/Microsoft/vscode)?  Default launch configurations are provided for debugging both the Electron main process and Oni application from VSCode.

## Production build

A production build removes sourcemaps and applies minification, so it's worth testing in this config:

- `npm run build`
- `npm link` (only needed the first time)
- `oni`

## Hot-reload build

The optimal way to debug ONI is to use:

```
npm run start
```

This enables hot-reload of CSS styles, React components, and will automatically reload ONI when other javascript has changed. Also, the hot-reload webpack config has source maps enabled.

If you use the hot-reload build of ONI to make changes - you'll end up reloading your editor every time you make a javascript change. For that reason, I recommend keeping two instances open - one for development and one to see the changes.

### Coding instance

- `npm run build` - build latest source
- `npm link` - (only needed the first time, but this enables the ONI command)
- `oni` - open the "coding" instance (optional: set a unique colorscheme to differentiate)

### Test instance

- `npm run start` - start ONI against the webpack live-reload service - our "running" instance

Then, the flow is to make the code changes in the "coding" instance, and see them reflected immediately in the "running instance".

Here's an example of using hot-reloading to edit the cursor (albeit in not very useful ways) in real time:
![cursor-hot-reload](http://i.imgur.com/pabtP0H.gif)
