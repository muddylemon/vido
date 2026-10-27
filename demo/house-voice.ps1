Add-Type -AssemblyName System.Speech
$lines = @(
 'Welcome to the casino. A vision board with an ATM.',
 'Your first bet is free. So is the first bite on a fishhook.',
 'Two cherries and a lemon! That is almost retirement.',
 'I won twenty bucks! It only cost me eighty.',
 'They called me a V I P. Very Important Payment.',
 'I am due a win. The machine is due a yacht.',
 'Please gamble responsibly. Our yacht depends on it.',
 'The house always wins. Weird. I came here to afford one.'
)
$voice = New-Object System.Speech.Synthesis.SpeechSynthesizer
$voice.Rate = 1
for ($i=0; $i -lt $lines.Count; $i++) {
 $voice.SetOutputToWaveFile((Join-Path $PSScriptRoot "../out/house-voice-$i.wav"))
 $voice.Speak($lines[$i])
 $voice.SetOutputToNull()
}
$voice.Dispose()
