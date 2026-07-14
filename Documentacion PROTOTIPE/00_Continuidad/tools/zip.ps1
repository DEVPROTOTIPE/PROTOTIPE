$source = Get-Item 'Documentacion PROTOTIPE/00_Continuidad'
$zip = 'Documentacion PROTOTIPE/00_Continuidad.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Add-Type -AssemblyName System.IO.Compression.FileSystem
$archive = [System.IO.Compression.ZipFile]::Open($zip, 'Create')
Get-ChildItem -Path $source.FullName -Recurse | Where-Object { !$_.PSIsContainer } | ForEach-Object {
    $relative = $_.FullName.Substring($source.FullName.Length + 1).Replace('\', '/')
    [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($archive, $_.FullName, $relative)
}
$archive.Dispose()
