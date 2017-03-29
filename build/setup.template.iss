; setup.template.iss
;
; This is an InnoSetup script file used for generating the Windows Installer
; Note that this is a template and variables of the form {{..}} should be replaced
; by `BuildSetupTemplate.iss`. Variables of the form {..} are InnoSetup-specific variables.
;
; See http://www.jrsoftware.org/isinfo.php for more info


[Setup]
AppName={{AppName}}
AppVersion={{Version}}
DefaultDirName={pf}\{{AppName}}
DefaultGroupName={{AppName}}
UninstallDisplayIcon={app}\{{AppExecutableName}}
Compression=zip
SolidCompression=yes
OutputBaseFilename={{AppSetupName}}

[Files]
Source: "C:\oni\dist\win-ia32-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Icons]
Name: "{group}\{{AppName}}"; Filename: "{app}\{{AppExecutableName}}"
