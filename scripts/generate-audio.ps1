# Generates synthesized narration for the Voices section.
# These are text-to-speech readings of the written record, NOT original recordings.
# Requires Windows PowerShell / .NET System.Speech.

Add-Type -AssemblyName System.Speech

$outputDir = Join-Path $PSScriptRoot '..\public\audio'
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

$format = New-Object System.Speech.AudioFormat.SpeechAudioFormatInfo(
  16000,
  [System.Speech.AudioFormat.AudioBitsPerSample]::Sixteen,
  [System.Speech.AudioFormat.AudioChannel]::Mono
)

$clips = @(
  @{
    File = 'teesta.wav'
    Voice = 'Microsoft Zira Desktop'
    Rate = -1
    Text = 'We stand here at Jantar Mantar not just as protesters, but as witnesses. The instruments behind us measure time with precision. We demand that same precision in justice. Every day without an F I R is a day the Constitution bleeds.'
  },
  @{
    File = 'harsh.wav'
    Voice = 'Microsoft David Desktop'
    Rate = -1
    Text = 'This observatory was built to track celestial bodies. Today it tracks the moral cosmos of our republic. When the state turns against its citizens, every institution must become a site of resistance. Jantar Mantar now measures the distance between promise and performance.'
  },
  @{
    File = 'survivor.wav'
    Voice = 'Microsoft Zira Desktop'
    Rate = -2
    Text = 'They came at night. We were sleeping. The sound of boots, the shouting, the tearing of tents. I saw them drag away my brother. We are not criminals. We are citizens asking for justice. Is that too much to ask?'
  },
  @{
    File = 'lawyer.wav'
    Voice = 'Microsoft Zira Desktop'
    Rate = 0
    Text = 'The law is clear. Section one fifty four of the C R P C mandates F I R registration. The Supreme Court in Lalita Kumari versus State of Uttar Pradesh made it binding. Police refusal is not discretion. It is contempt. We will pursue every legal remedy.'
  },
  @{
    File = 'chant.wav'
    Voice = 'Microsoft David Desktop'
    Rate = 1
    Text = 'Nyay do. Nyay do. Inquilab zindabad. Samvidhan bachao. Desh bachao. Hum kya chahte? Nyay! Kab chahte? Abhi!'
  }
)

$synth = New-Object System.Speech.Synthesis.SpeechSynthesizer

foreach ($clip in $clips) {
  $synth.SelectVoice($clip.Voice)
  $synth.Rate = $clip.Rate
  $path = Join-Path $outputDir $clip.File
  $synth.SetOutputToWaveFile($path, $format)
  $synth.Speak($clip.Text)
  $synth.SetOutputToNull()
  Write-Host ("Generated {0}" -f $path)
}

$synth.Dispose()
