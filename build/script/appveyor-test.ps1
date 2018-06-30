function exitIfFailed() {
  if ($LastExitCode -ne 0) {
    exit $LastExitCode
  }
}

# Output useful info for debugging.
node --version
npm --version

Write-Host "Platform: " $env:PLATFORM
Write-Host "AppVeyor: " $env:APPVEYOR

# Build
yarn run build ; exitIfFailed
yarn run lint ; exitIfFailed
yarn run test:unit ; exitIfFailed

# Create setup package
yarn run copy-icons ; exitIfFailed

$platform = (Get-Item env:PLATFORM).value

if ($platform -eq "x86") {
    yarn run dist:win:x86
} else {
    yarn run dist:win:x64
}

yarn run pack:win ; exitIfFailed

# Run integration tests
yarn run test:integration ; exitIfFailed
yarn run demo:screenshot ; exitIfFailed
yarn run test:setup ; exitIfFailed

# Upload bits to azure
npm run upload:dist ; exitIfFailed
