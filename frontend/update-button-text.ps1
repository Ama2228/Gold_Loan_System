# Update button text colors from white to black for yellow buttons
$files = @(
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\staff\NewTicket.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\staff\RegisterCustomer.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\staff\CustomerInquiry.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\staff\Tickets.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\staff\Reminders.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\staff\Appointments.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\staff\Reports.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\Login.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\Register.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\Home.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\pages\LoginAs.jsx",
    "C:\Users\DELL\Desktop\Pawning Management System\frontend\src\layouts\DashboardLayout.jsx"
)

$replacements = @(
    @{ Find = "rounded-lg bg-yellow-500 px-6 py-2 text-white"; Replace = "rounded-lg bg-yellow-500 px-6 py-2 text-black" },
    @{ Find = "rounded-lg bg-yellow-500 px-6 py-3 text-white"; Replace = "rounded-lg bg-yellow-500 px-6 py-3 text-black" },
    @{ Find = "rounded-lg bg-yellow-500 px-4 py-2 text-white"; Replace = "rounded-lg bg-yellow-500 px-4 py-2 text-black" },
    @{ Find = "rounded-lg bg-yellow-500 px-4 py-3 text-white"; Replace = "rounded-lg bg-yellow-500 px-4 py-3 text-black" },
    @{ Find = "w-full rounded-lg bg-yellow-500 px-6 py-3 text-white"; Replace = "w-full rounded-lg bg-yellow-500 px-6 py-3 text-black" },
    @{ Find = "w-full rounded-lg bg-yellow-500 px-4 py-2 text-white"; Replace = "w-full rounded-lg bg-yellow-500 px-4 py-2 text-black" }
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "Processing: $file"
        $content = Get-Content $file -Raw
        
        foreach ($replacement in $replacements) {
            $content = $content -replace [regex]::Escape($replacement.Find), $replacement.Replace
        }
        
        Set-Content $file -Value $content
        Write-Host "Updated: $file"
    }
}

Write-Host "Button text colors updated successfully!"
