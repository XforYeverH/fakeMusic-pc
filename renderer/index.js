const { ipcRenderer } = require('electron')
const{ $ ,converDuration} = require('./helper')
let musicAudio = new Audio()
let allTracks
let currentTrack
$('add-music-button').addEventListener('click',()=>{
    ipcRenderer.send('add-music-window')
})

$('music-lyric').addEventListener('click',()=>{
    ipcRenderer.send('music-lyric-window')
})


const renderListHTML = (tracks) =>{
    const tracksList = $('tracksList')
    const tracksListHTML = tracks.reduce((html,track) =>{
      html += `<li class = "row music-track list-group-item d-flex justify-content-between align-items-center" >
        <div class="col-9">
          <i class="fas fa-music mr-2 text-secondary"></i>
          <b>${track.fileName}</b>
        </div>
        <div class="col-3">
          <i class="fas fa-play mr-3 " id="${track.id}_play" data-id="${track.id}"></i>
          <i class="fas fa-trash-alt mr-3 " id="${track.id}_delete" data-id="${track.id}"></i>
          <i class="fas fa-image mr-3 " id="${track.id}_img" data-id="${track.id}"></i>
          <i class="fas fa-file-word " id="${track.id}_word" data-id="${track.id}"></i>

        </div>
      </li>`
      return html
    },'')
    const emptyTrackHTML = '<div class="alert alert-primary">还没有添加任何音乐</div>'
    tracksList.innerHTML = tracks.length ? `<ul class="list-group">${tracksListHTML}</ul>` : emptyTrackHTML
}

const renderPlayerHTML = (name,duration) =>{
    const player = $('player-status')
    const html = `<div class="col font-weight-bold">
                    正在播放:${name}
                    </div>
                    <div class="col">
                      <span id= "current-seeker">00:00</span> /${converDuration(duration)}
                    </div>`
    player.innerHTML = html
}
const updateProgressHTML = (currentTime,duration) =>{//计算progress
    const progress = Math.floor(currentTime / duration * 100)
    const bar = $('player-progress')
    bar.innerHTML = progress + '%'
    bar.style.width = progress + '%'
    const seeker = $('current-seeker')
    seeker.innerHTML = converDuration(currentTime)
}
ipcRenderer.on('getTracks', (event,tracks) => {
    console.log('receive tracks' , tracks)
    allTracks = tracks
    renderListHTML(tracks)
    if(currentTrack){
        var musicPlaying = $(`${currentTrack.id}_play`)
        var classValue = musicPlaying.getAttribute('class').replace('fa-play','fa-pause')
        musicPlaying.setAttribute('class',classValue)
    }
})
musicAudio.addEventListener('loadedmetadata', () =>{//渲染播放器状态
    renderPlayerHTML(currentTrack.fileName, musicAudio.duration)
})

musicAudio.addEventListener('timeupdate', ()=>{//更新播放器状态
   updateProgressHTML(musicAudio.currentTime,musicAudio.duration)
})

musicAudio.addEventListener('ended', () =>{
    var musicIndex = allTracks.findIndex(track => track.id === currentTrack.id )
    var tracksLength = allTracks.length
    musicIndex += 1
    // if(musicIndex >= tracksLength) {
    //     musicIndex = 0
    // }
    musicIndex %= tracksLength
    console.log(musicIndex)
    console.log(tracksLength)
    console.log(currentTrack.id)
    var oldMusicItem =$(`${currentTrack.id}_play`) 
    currentTrack = allTracks[musicIndex]
     console.log(currentTrack.id)
    var newMusicItem = $(`${currentTrack.id}_play`)

    var oldClassVal = oldMusicItem.getAttribute('class').replace('fa-pause' , 'fa-play')
    oldMusicItem.setAttribute('class', oldClassVal)
    var newClassVal = newMusicItem.getAttribute('class').replace('fa-play','fa-pause')
    newMusicItem.setAttribute('class', newClassVal)

    musicAudio.src = currentTrack.path
    musicAudio.play()

})

$('tracksList').addEventListener('click',(event) =>{
    event.preventDefault()
    const {dataset, classList} = event.target
    const id = dataset && dataset.id
    if(id && classList.contains('fa-play')){//播放音乐
        if(currentTrack && currentTrack.id === id){//继续播放音乐
            musicAudio.play()
        }else {//播放新的歌曲，还原之前的图标
            currentTrack = allTracks.find(track => track.id === id )
            musicAudio.src = currentTrack.path
            musicAudio.play()
            const resetIconEle = document.querySelector('.fa-pause')
            if(resetIconEle){
                resetIconEle.classList.replace('fa-pause' , 'fa-play')
            }
        }
        classList.replace('fa-play' , 'fa-pause')
    } else if (id && classList.contains('fa-pause')) {//暂停播放
        musicAudio.pause()
        classList.replace('fa-pause','fa-play')
    } else if (id && classList.contains('fa-trash-alt')) {//发送事件 删除这条音乐
        ipcRenderer.send('delete-track' , id)
    } else if (id && classList.contains('fa-image')) {
        ipcRenderer.send('get-poster' , id)
    } else {
        ipcRenderer.send('get-lyrics' , id)
    }
})

$('music_bar').addEventListener('click', (event) => {
    var bar_w = $('music_bar').offsetWidth
    var click_w = event.offsetX
    // if (musicAudio.canPlayType()){
        musicAudio.currentTime = (click_w / bar_w) * musicAudio.duration
    //}
})