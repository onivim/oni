; -- Example1.iss --
; Demonstrates copying 3 files and creating an icon.

; SEE THE DOCUMENTATION FOR DETAILS ON CREATING .ISS SCRIPT FILES!

[Setup]
AppName=Oni
AppVersion=0.1.2
DefaultDirName={pf}\Oni
DefaultGroupName=Oni
UninstallDisplayIcon={app}\oni.exe
Compression=lzma2
SolidCompression=yes
OutputBaseFilename=Oni_Windows_x86

[Files]
Source: "C:\oni\dist\win-ia32-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\Oni"; Filename: "{app}\oni.exe"
