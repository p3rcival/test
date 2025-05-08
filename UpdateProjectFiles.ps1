
$sourcePath = "C:\Users\localadmin\Desktop\workout_app4"
#$allFiles = Get-ChildItem -Path $sourcePath -Recurse -Include *.tsx, *.js, *.json, *.ts, *.jsx, *.css, *.html | Where-Object {$_.FullName -notmatch "node_modules" -and $_.FullName -notmatch "dist" -and $_.FullName -notmatch "build" -and $_.FullName -notmatch "coverage" -and $_.FullName -notmatch "test"}
$allFiles | ForEach-Object {
    $filePath = $_.FullName
    $fileName = $_.Name
    $newFileName = $fileName -replace '\.tsx$', '_backup.tsx'
    $newFileName = $fileName -replace '\.js$', '_backup.js'
    $newFileName = $fileName -replace '\.json$', '_backup.json'
    $newFileName = $fileName -replace '\.ts$', '_backup.ts'
    $newFileName = $fileName -replace '\.jsx$', '_backup.jsx'
    $newFileName = $fileName -replace '\.css$', '_backup.css'
    $newFileName = $fileName -replace '\.html$', '_backup.html'

    
    $parentPath = "$($sourcePath)\backup\"
    $newFilePath = Join-Path -Path $parentPath -ChildPath $newFileName

    # Check if the file already exists
    if (-not (Test-Path -Path $newFilePath)) {
        # Create a backup of the file
        Copy-Item -Path $filePath -Destination $newFilePath -Force
        Write-Host "Backed up $filePath to $newFilePath"
    } else {
        Write-Host "Backup file $newFilePath already exists. Skipping."
    }
}
