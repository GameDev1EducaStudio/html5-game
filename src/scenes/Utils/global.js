export var w;
export var h;
export var cx;
export var cy;

export function setGameSize(game){
    w = game.canvas.width;
    h = game.canvas.height;

    cx = w / 2;
    cy = h / 2;
}
 
export function playSFX(scene, key) { 
    if (!scene.registry.get('isVolOn')) return;
 
    let sound = scene.sound.get(key);

    if (!sound) { 
        sound = scene.sound.add(key);
    }
 
    if (sound.isPlaying) {
        sound.stop();
    }

    sound.play();
}