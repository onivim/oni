# Output useful info for debugging.
node --version
npm --version

# Build
npm run build
npm run lint
npm run test:unit

# Create setup package
npm run copy-icons

$platform = (Get-Item env:PLATFORM).value

if ($platform -eq "x86") {
    npm run dist:win:x86
} else {
    npm run dist:win:x64
}

npm run pack:win

# Run integration tests
npm run test:integration
npm run demo:screenshot

# Upload bits to azure
npm run upload:dist