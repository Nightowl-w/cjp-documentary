"""Generate Hindi narration for the Voices section using Microsoft Edge neural TTS.

These are synthesized readings of the written record, not original recordings.
Requires: python -m pip install edge-tts
"""

import asyncio
from pathlib import Path

import edge_tts

OUTPUT_DIR = Path(__file__).resolve().parent.parent / "public" / "audio"

CLIPS = [
    {
        "file": "teesta.mp3",
        "voice": "hi-IN-SwaraNeural",
        "rate": "-5%",
        "text": (
            "हम यहाँ जंतर मंतर पर सिर्फ़ विरोध करने नहीं, बल्कि गवाह बनकर खड़े हैं। "
            "हमारे पीछे खड़े ये यंत्र समय को इतनी सटीकता से मापते हैं। "
            "हम माँग करते हैं कि न्याय में भी वही सटीकता हो। "
            "जिस दिन एफ आई आर दर्ज नहीं होती, उस दिन संविधान का खून बहता है।"
        ),
    },
    {
        "file": "harsh.mp3",
        "voice": "hi-IN-MadhurNeural",
        "rate": "-5%",
        "text": (
            "यह वेधशाला आकाश के पिंडों को देखने के लिए बनाई गई थी। "
            "आज यह हमारे गणतंत्र के नैतिक आकाश को देख रही है। "
            "जब राज्य अपने ही नागरिकों के खिलाफ़ खड़ा हो जाए, "
            "तब हर संस्थान को प्रतिरोध की जगह बनना पड़ता है। "
            "जंतर मंतर अब वादे और उसके पूरा होने के बीच की दूरी नाप रहा है।"
        ),
    },
    {
        "file": "survivor.mp3",
        "voice": "hi-IN-SwaraNeural",
        "rate": "-12%",
        "text": (
            "वे रात में आए। हम सो रहे थे। जूतों की आवाज़, चीख़ें, तंबू फटने की आवाज़। "
            "मैंने देखा कि वे मेरे भाई को खींचकर ले गए। "
            "हम अपराधी नहीं हैं। हम नागरिक हैं, जो न्याय माँग रहे हैं। "
            "क्या यह माँगना बहुत ज़्यादा है?"
        ),
    },
    {
        "file": "lawyer.mp3",
        "voice": "hi-IN-SwaraNeural",
        "rate": "-3%",
        "text": (
            "कानून स्पष्ट है। सी आर पी सी की धारा एक सौ चौवन में एफ आई आर दर्ज करना अनिवार्य है। "
            "सुप्रीम कोर्ट ने ललिता कुमारी बनाम उत्तर प्रदेश राज्य में इसे बाध्यकारी बनाया है। "
            "पुलिस का इनकार कोई विवेकाधिकार नहीं है। यह अदालत की अवमानना है। "
            "हम हर कानूनी रास्ता अपनाएँगे।"
        ),
    },
    {
        "file": "chant.mp3",
        "voice": "hi-IN-MadhurNeural",
        "rate": "+0%",
        "text": (
            "न्याय दो! न्याय दो! इंक़लाब ज़िंदाबाद! संविधान बचाओ! देश बचाओ! "
            "हम क्या चाहते हैं? न्याय! कब चाहते हैं? अभी! अभी!"
        ),
    },
]


async def generate_clip(clip: dict) -> None:
    output = OUTPUT_DIR / clip["file"]
    communicator = edge_tts.Communicate(
        clip["text"],
        clip["voice"],
        rate=clip["rate"],
    )
    await communicator.save(str(output))
    print(f"Generated {output} ({output.stat().st_size:,} bytes)")


async def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    for clip in CLIPS:
        await generate_clip(clip)


if __name__ == "__main__":
    asyncio.run(main())
