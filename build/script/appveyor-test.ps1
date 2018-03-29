function exitIfFailed() {
  if ($LastExitCode -ne 0) {
    exit $LastExitCode
  }
}

# Output useful info for debugging.
node --version
npm --version

# Build
npm run build ; exitIfFailed
npm run lint ; exitIfFailed
npm run test:unit ; exitIfFailed

# Create setup package
npm run copy-icons ; exitIfFailed

$platform = (Get-Item env:PLATFORM).value

if ($platform -eq "x86") {
    npm run dist:win:x86
} else {
    npm run dist:win:x64
}

npm run pack:win ; exitIfFailed

# Run integration tests
npm run test:integration ; exitIfFailed
npm run demo:screenshot ; exitIfFailed

# Upload bits to azure
npm run upload:dist ; exitIfFailed