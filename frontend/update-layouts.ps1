$files = @(
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\layouts\DashboardLayout.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\components\Sidebar.js",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\components\Topbar.js"
)

$replacements = @(
    @{ Find = "border-teal-500"; Replace = "border-yellow-500" },
    @{ Find = "bg-teal-500"; Replace = "bg-yellow-500" },
    @{ Find = "text-teal-600"; Replace = "text-yellow-600" },
    @{ Find = "text-teal-500"; Replace = "text-yellow-500" },
    @{ Find = "bg-teal-50"; Replace = "bg-yellow-50" },
    @{ Find = "hover:bg-teal-50"; Replace = "hover:bg-yellow-50" },
    @{ Find = "hover:bg-teal-600"; Replace = "hover:bg-yellow-600" },
    @{ Find = "hover:bg-teal-700"; Replace = "hover:bg-yellow-700" },
    @{ Find = "focus:border-teal-500"; Replace = "focus:border-yellow-500" },
    @{ Find = "focus:ring-teal-500"; Replace = "focus:ring-yellow-500" },
    @{ Find = "border-l-4 border-teal-500"; Replace = "border-l-4 border-yellow-500" }
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

Write-Host "Layout files updated successfully!"
