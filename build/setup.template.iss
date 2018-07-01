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
ChangesAssociations=yes

[Files]
Source: "{{SourcePath}}"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs

[Tasks]
Name: "addtopath"; Description: "Add {{AppName}} to %PATH%"; GroupDescription: "Other"
Name: "registerAsEditor"; Description: "Register {{AppName}} as an editor for all supported file types."; GroupDescription: "Other"
Name: "addToRightClickMenu"; Description: "Add {{AppName}} to the right click menu for all files."; GroupDescription: "Other"

[Icons]
Name: "{group}\{{AppName}}"; Filename: "{app}\{{AppExecutableName}}"

[Run]
Filename: "{app}\{{AppName}}"; Flags: postinstall skipifsilent nowait

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

// http://stackoverflow.com/a/23838239/261019
procedure Explode(var Dest: TArrayOfString; Text: String; Separator: String);
var
  i, p: Integer;
begin
  i := 0;
  repeat
    SetArrayLength(Dest, i+1);
    p := Pos(Separator,Text);
    if p > 0 then begin
      Dest[i] := Copy(Text, 1, p-1);
      Text := Copy(Text, p + Length(Separator), Length(Text));
      i := i + 1;
    end else begin
      Dest[i] := Text;
      Text := '';
    end;
  until Length(Text)=0;
end;

// This update step checks for the old path variable ({app}) and removes it when installing if needed.
// This is a modified version of the UninstallStepChanged, taken from VSCode.
procedure CurStepChanged(CurUninstallStep: TSetupStep);
var
  Path: string;
  OldOniPath: string;
  Parts: TArrayOfString;
  NewPath: string;
  i: Integer;
begin
  if not CurUninstallStep = ssInstall then begin
    exit;
  end;
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', Path)
  then begin
    exit;
  end;
  NewPath := '';
  OldOniPath := ExpandConstant('{app}')
  Explode(Parts, Path, ';');
  for i:=0 to GetArrayLength(Parts)-1 do begin
    if CompareText(Parts[i], OldOniPath) <> 0 then begin
      NewPath := NewPath + Parts[i];

      if i < GetArrayLength(Parts) - 1 then begin
        NewPath := NewPath + ';';
      end;
    end;
  end;
  RegWriteExpandStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', NewPath);
end;

// This is taken from the VSCode installer file.
procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  Path: string;
  OniPath: string;
  Parts: TArrayOfString;
  NewPath: string;
  i: Integer;
begin
  if not CurUninstallStep = usUninstall then begin
    exit;
  end;
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', Path)
  then begin
    exit;
  end;
  NewPath := '';
  OniPath := ExpandConstant('{{cliPath}}')
  Explode(Parts, Path, ';');
  for i:=0 to GetArrayLength(Parts)-1 do begin
    if CompareText(Parts[i], OniPath) <> 0 then begin
      NewPath := NewPath + Parts[i];

      if i < GetArrayLength(Parts) - 1 then begin
        NewPath := NewPath + ';';
      end;
    end;
  end;
  RegWriteExpandStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', NewPath);
end;

[Registry]
{{RegistryKey}}