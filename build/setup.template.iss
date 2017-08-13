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
OutputBaseFilename={{AppSetupExecutableName}}
WizardImageFile={{WizardImageFilePath}}
WizardImageStretch=no
WizardSmallImageFile={{WizardSmallImageFilePath}}

[Files]
Source: "{{SourcePath}}"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Tasks]
Name: "addtopath"; Description: "Add Oni to %PATH%"; GroupDescription: "Other"

[Icons]
Name: "{group}\{{AppName}}"; Filename: "{app}\{{AppExecutableName}}"

[Run]
Filename: "{app}\{{AppExecutableName}}"; Flags: postinstall skipifsilent

[Code]
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OrigPath)
  then begin
    Result := True;
    exit;
  end;
  Result := Pos(';' + Param + ';', ';' + OrigPath + ';') = 0;
end;

[Registry]
{{RegistryKey}}