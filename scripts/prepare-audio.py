#!/usr/bin/env python3
"""Prepare the real-audio excerpts used in the CJP documentary.

Downloads the source recordings (audio only) with yt-dlp and cuts short,
attributed excerpts with ffmpeg. Full recordings stay online; only the
excerpts are written to public/audio/.

Usage:
    python scripts/prepare-audio.py [--ffmpeg PATH] [--keep-temp]

Requirements:
    python -m pip install yt-dlp
    ffmpeg on PATH, or: python -m pip install imageio-ffmpeg

Every excerpt is a short extract of a public recording, used for documentary
commentary and education. Rights remain with the original creators; the
mapping of clip -> source is printed at the end of the run.
"""
from __future__ import annotations

import argparse
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "public" / "audio"

SOURCES = [
    {
        "id": "vDD5ZgZpezk",
        "url": "https://www.youtube.com/watch?v=vDD5ZgZpezk",
        "title": "NDTV — Abhijeet Dipke after Dharmendra Pradhan's resignation",
    },
    {
        "id": "euPMOFtH_38",
        "url": "https://www.youtube.com/watch?v=euPMOFtH_38",
        "title": "Sonam Wangchuk — I AM STILL ALIVE | CHALO SANASAD (official)",
    },
    {
        "id": "qa20AKineKc",
        "url": "https://www.youtube.com/watch?v=qa20AKineKc",
        "title": "The Hindu — CJP protest ground report (Jantar Mantar)",
    },
    {
        "id": "BNS7Tr6ngmo",
        "url": "https://www.youtube.com/watch?v=BNS7Tr6ngmo",
        "title": "The Indian Express — CJP alleges denial of water, food and washrooms",
    },
]

# start/end are seconds in the original recording. fades are added on output.
CLIPS = [
    {
        "file": "dipke.mp3",
        "source": "vDD5ZgZpezk",
        "start": 7.4,
        "end": 38.0,
        "credit": "Abhijeet Dipke (founder, CJP) — NDTV, 25 July 2026",
    },
    {
        "file": "wangchuk.mp3",
        "source": "euPMOFtH_38",
        "start": 0.0,
        "end": 27.6,
        "credit": "Sonam Wangchuk — official channel, 28 June 2026 (Day 14 of hunger strike)",
    },
    {
        "file": "student.mp3",
        "source": "qa20AKineKc",
        "start": 71.0,
        "end": 95.9,
        "credit": "SSC aspirant — The Hindu ground report (name not stated in source)",
    },
    {
        "file": "parent.mp3",
        "source": "qa20AKineKc",
        "start": 208.5,
        "end": 222.5,
        "credit": "Parent at the protest — The Hindu ground report (name not stated in source)",
    },
    {
        "file": "cjp-rep.mp3",
        "source": "BNS7Tr6ngmo",
        "start": 0.0,
        "end": 19.5,
        "credit": "CJP organiser — The Indian Express, 20 June 2026 (name not stated in source)",
    },
    {
        "file": "chant.mp3",
        "source": "qa20AKineKc",
        "start": 156.0,
        "end": 179.4,
        "credit": "Crowd chant — The Hindu ground report",
    },
]


def find_ffmpeg(explicit: str | None) -> str:
    if explicit:
        return explicit
    found = shutil.which("ffmpeg")
    if found:
        return found
    try:
        import imageio_ffmpeg  # type: ignore

        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception as exc:  # noqa: BLE001
        raise SystemExit(
            "ffmpeg was not found. Install it, pass --ffmpeg PATH, "
            "or run: python -m pip install imageio-ffmpeg"
        ) from exc


def download(source: dict, temp_dir: Path) -> Path:
    target = temp_dir / f"{source['id']}.m4a"
    if target.exists():
        print(f"  cached  {source['id']}")
        return target
    cmd = [
        sys.executable,
        "-m",
        "yt_dlp",
        "--no-playlist",
        "-f",
        "bestaudio[ext=m4a]/bestaudio",
        "-o",
        str(temp_dir / "%(id)s.%(ext)s"),
        source["url"],
    ]
    if shutil.which("node"):
        cmd[3:3] = ["--js-runtimes", "node"]
    print(f"  fetch   {source['id']}  ({source['title']})")
    subprocess.run(cmd, check=True)
    if not target.exists():
        raise SystemExit(f"yt-dlp did not produce {target.name}")
    return target


def cut(ffmpeg: str, src: Path, clip: dict, out_dir: Path) -> None:
    duration = clip["end"] - clip["start"]
    out = out_dir / clip["file"]
    audio_filter = (
        "loudnorm=I=-16:TP=-1.5:LRA=11,"
        f"afade=t=in:st=0:d=0.35,afade=t=out:st={duration - 0.7:.2f}:d=0.7"
    )
    subprocess.run(
        [
            ffmpeg,
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-ss",
            str(clip["start"]),
            "-to",
            str(clip["end"]),
            "-i",
            str(src),
            "-af",
            audio_filter,
            "-ac",
            "2",
            "-ar",
            "44100",
            "-b:a",
            "128k",
            str(out),
        ],
        check=True,
    )
    print(f"  write   public/audio/{clip['file']}  ({duration:.1f}s)")


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--ffmpeg", help="path to the ffmpeg binary")
    parser.add_argument("--keep-temp", action="store_true", help="keep downloaded source audio")
    args = parser.parse_args()

    ffmpeg = find_ffmpeg(args.ffmpeg)
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    with tempfile.TemporaryDirectory(prefix="cjp-audio-") as tmp:
        temp_dir = Path(tmp)
        sources = {source["id"]: source for source in SOURCES}
        needed = {clip["source"] for clip in CLIPS}
        downloaded: dict[str, Path] = {}

        print("Downloading source audio (full recordings stay on YouTube):")
        for source_id in sorted(needed):
            downloaded[source_id] = download(sources[source_id], temp_dir)

        print("Cutting excerpts into public/audio/:")
        for clip in CLIPS:
            cut(ffmpeg, downloaded[clip["source"]], clip, OUT_DIR)

        print("\nAttribution map:")
        for clip in CLIPS:
            print(f"  public/audio/{clip['file']} -> {clip['credit']}")

        if args.keep_temp:
            kept = Path(tempfile.mkdtemp(prefix="cjp-audio-keep-"))
            for source_id, path in downloaded.items():
                shutil.copy2(path, kept / path.name)
            print(f"\nSource audio kept in {kept}")


if __name__ == "__main__":
    main()
