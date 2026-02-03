$files = @(
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\components\StatCard.js",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\components\StatCard.jsx"
)

$replacements = @(
    @{ Find = "border-teal-500"; Replace = "border-yellow-500" },
    @{ Find = "bg-teal-500"; Replace = "bg-yellow-500" },
    @{ Find = "text-teal-600"; Replace = "text-yellow-600" },
    @{ Find = "text-teal-500"; Replace = "text-yellow-500" },
    @{ Find = "bg-teal-50"; Replace = "bg-yellow-50" }
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw
        
        foreach ($replacement in $replacements) {
            $content = $content -replace $replacement.Find, $replacement.Replace
        }
        
        Set-Content $file -Value $content
        Write-Host "Updated: $file"
    }
}

Write-Host "StatCard components updated successfully!"
