// updated for github pages
console.log("hello");
let songs = [];
let playerBox = document.querySelector(".player-box");
let pause = document.querySelector(".pause");
let play = document.querySelector("#play");
let songPlay = document.querySelector(".play");
let topPlay = document.querySelectorAll(".top-play");
let audio = null;
let currentSongIndex = -1;
let displayName = document.querySelector(".display-name");
let autoPlay = document.querySelector(".auto-play");
let isAutoPlay = false;
let previous = document.querySelector(".previous");
let next = document.querySelector(".next");
let vol = document.querySelector(".range").getElementsByTagName("input")[0];
vol.value = 50;


function formatDuration(duration) {
    // Round down the total seconds to the nearest integer
    const totalSeconds = Math.floor(duration);

    // Calculate minutes and seconds
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    // Add leading zero to seconds if needed
    const formattedSeconds = seconds.toString().padStart(2, '0');

    // Return formatted time (e.g. "0:04")
    return `${minutes}:${formattedSeconds}`;
}


function playSong(index, btn = null) {
    // Stop any currently playing song
    if (audio) audio.pause();

    currentSongIndex = index;
    audio = new Audio(songs[currentSongIndex]);
    audio.volume = vol.value / 100;
    audio.play();

    // ✅ Detect play/pause from external controls (earphones, system buttons, etc.)
    audio.addEventListener("play", () => {
        play.classList.add("hide-no-mouse");
        pause.classList.remove("hide-no-mouse");
    });

    audio.addEventListener("pause", () => {
        play.classList.remove("hide-no-mouse");
        pause.classList.add("hide-no-mouse");
    });

    audio.addEventListener("loadedmetadata", () => {
        document.querySelector(".totaltime").innerHTML = `${formatDuration(audio.duration)}`;
    });


    audio.addEventListener("timeupdate", () => {
        // console.log(audio.currentTime , audio.duration);
        document.querySelector(".songtime").innerHTML = `${formatDuration(audio.currentTime)}`;
        if (!isNaN(audio.duration)) {
            document.querySelector(".totaltime").innerHTML = ` ${formatDuration(audio.duration)}`;
        }
        document.querySelector(".play-circle").style.left = (audio.currentTime / audio.duration) * 100 + "%";

    });

    // UI updates
    playerBox.style.bottom = "0";
    document.querySelectorAll(".card").forEach(c => c.classList.remove("hover-color"));
    let card = Array.from(document.querySelectorAll(".card")).find(c => {
        let btn = c.querySelector(".play-button");
        return songs[index] === songs[btn.dataset.song];
    });


    // Log the song name or show it somewhere
    if (card) {
        let songNameElement = card.querySelector(".song"); // get the <p class="song">
        let singerNameElement = card.querySelector(".name");
        let songName = `${songNameElement.innerText.trim()} - ${singerNameElement.innerText.trim()}`;   // extract the song name text
        displayName.innerHTML = songName;
        card.classList.add("hover-color");
        console.log("Now playing:", songName);
    }





    // Auto play next when current ends
    audio.addEventListener("ended", () => {
        if (isAutoPlay) {
            if (currentSongIndex < songs.length - 1) {
                playSong(currentSongIndex + 1);
            } else {
                playSong(0);
            }
        } else {
            play.classList.remove("hide-no-mouse");
            pause.classList.add("hide-no-mouse");
        }
    });


}
autoPlay.addEventListener("click", () => {
    isAutoPlay = !isAutoPlay;
    autoPlay.classList.toggle("active", isAutoPlay);
    autoPlay.innerHTML = `<i class="fa-solid fa-repeat" style="color: #000000;"></i> <span class="auto-text">${isAutoPlay ? "ON" : "OFF"}</span>`;
});



async function getSongs() {
    //let a = await fetch("http://127.0.0.1:5500/songs/");
    let a = await fetch("./songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");


    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    

    return songs
}

/*async function getSongs() {
    let a = await fetch("http://127.0.0.1:5500/songs/");
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a");

    // Create a map of file name → href
    const fileMap = {};
    for (let element of as) {
        if (element.href.endsWith(".mp3")) {
            const name = element.href.split("/").pop(); // just the file name
            fileMap[name] = element.href;
        }
    }

    // Match each card's song using its file name
    const cardButtons = document.querySelectorAll(".play-button");
    const orderedSongs = [];
    cardButtons.forEach(btn => {
        const index = parseInt(btn.dataset.song, 10);
        const card = btn.closest(".card");
        if (card) {
            const songName = card.querySelector(".song").innerText.trim();
            const singerName = card.querySelector(".name").innerText.trim();
            
            // Construct the expected filename (adjust if your filenames differ)
            const fileKey = `${songName}.mp3`; 
            if (fileMap[fileKey]) {
                orderedSongs[index] = fileMap[fileKey];
            }
        }
    });

    return orderedSongs.filter(Boolean);
}*/




async function main() {
    songs = await getSongs(); // Use the fetched list directly
    console.log(songs);

    let playBtn = document.querySelectorAll(".play-button");
    playBtn.forEach(btn => {
        btn.addEventListener('click', () => {
            const index = Number(btn.dataset.song);
            playSong(index, btn);
            playerBox.style.bottom = "0";
            play.classList.add("hide-no-mouse");
            pause.classList.remove("hide-no-mouse");
        });
    });
}


main();
pause.addEventListener('click', () => {
    if (audio) {
        audio.pause();
    }
    play.classList.remove('hide-no-mouse');
    pause.classList.add('hide-no-mouse');
});


play.addEventListener('click', () => {
    if (audio) {
        audio.play();
    }
    play.classList.add('hide-no-mouse');
    pause.classList.remove('hide-no-mouse');
});


// making next and previous
next.addEventListener("click", () => {
    if (currentSongIndex < songs.length - 1) {
        playSong(currentSongIndex + 1);  // ✅ This updates audio + UI + name
    } else {
        playSong(0); // ✅ Loop back to first song if at end
    }
});

previous.addEventListener("click", () => {
    if (currentSongIndex > 0) {
        playSong(currentSongIndex - 1);  // ✅ This updates audio + UI + name
    } else {
        playSong(songs.length - 1);
    }
});


document.querySelector(".seekbar").addEventListener('click', e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".play-circle").style.left = percent + "%";
    audio.currentTime = (audio.duration * percent) / 100;
})

let left = document.querySelector(".left");
let leftBar = document.querySelector(".left-bar");
let cross = document.querySelector(".cross");


leftBar.addEventListener("click", () => {
    left.style.left = "6" + "%";
    left.style.position = "fixed";
    leftBar.querySelector("i").style.color = "#1DB954";
    cross.classList.remove("hidden");
});

cross.addEventListener("click", () => {
    cross.classList.add("hidden");
    leftBar.querySelector("i").style.color = "#FFFFFF";
    left.style.left = "-100" + "%";
});



let volumeOn = document.querySelector(".volume-on");
let volumeMute = document.querySelector("#volume-mute");
vol.addEventListener("change", (e) => {
    volumeMute.classList.add("hide-no-mouse");
    volumeOn.classList.remove("hide-no-mouse");
    if (audio) {
        console.log(e.target.value);
        audio.volume = e.target.value / 100;
    }
});

volumeOn.addEventListener("click", () => {
    audio.volume = 0;
    volumeMute.classList.remove("hide-no-mouse");
    volumeOn.classList.add("hide-no-mouse");
});

volumeMute.addEventListener("click", () => {
    audio.volume = vol.value / 100;
    volumeMute.classList.add("hide-no-mouse");
    volumeOn.classList.remove("hide-no-mouse");
});

function updateVolumeBar() {
    let value = vol.value;
    vol.style.background = `linear-gradient(to right, #1DB954 ${value}%, #ddd ${value}%)`;
}

// Update while sliding
vol.addEventListener("input", (e) => {
    audio.volume = e.target.value / 100;
    updateVolumeBar();
});

// Initial call on page load:
updateVolumeBar();

