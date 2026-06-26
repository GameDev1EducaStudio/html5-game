import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class Play extends Phaser.Scene {

    constructor() {
        super('Play');
    }

    preload() {
        this.load.image('logo', 'assets/logo.png');
        this.load.image('bgStart', 'assets/bgStart.png');
        this.load.image('panelLevelSelect', 'assets/panelLevelSelect.png');
        
        this.load.image('btnHelp', 'assets/btnHelp.png');
        this.load.image('btnHelpHover', 'assets/btnHelpHover.png');
        this.load.image('btnHelpClick', 'assets/btnHelpClick.png');
        
        this.load.image('btnPlay', 'assets/btnPlay.png');
        this.load.image('btnPlayHover', 'assets/btnPlayHover.png');
        this.load.image('btnPlayClick', 'assets/btnPlayClick.png');
        
        this.load.image('btnShop', 'assets/btnShop.png');
        this.load.image('btnShopHover', 'assets/btnShopHover.png');
        this.load.image('btnShopClick', 'assets/btnShopClick.png');
        
        this.load.image('btnCancel', 'assets/btnCancel.png');
        this.load.image('btnCancelHover', 'assets/btnCancelHover.png');
        this.load.image('btnCancelClick', 'assets/btnCancelClick.png');
        
        // JALUR AUDIO: Menggunakan folder 'Audio' kapital
        this.load.audio('sndClick', 'assets/Audio/sndClick.mp3');
    }

    create() {
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;

        // PROTEKSI SCENE: Stop UIScene lama dan jalankan ulang agar sinkron
        this.scene.stop('UIScene');
        this.scene.launch('UIScene');
        this.scene.bringToTop('UIScene');
     
        const bgTop = this.add.image(currentW / 2, currentH / 2, 'bgStart').setDepth(0);

        const scaleX = currentW / bgTop.width;
        const scaleY = currentH / bgTop.height;
        const scale = Math.max(scaleX, scaleY);

        bgTop.setScale(scale)
             .setScrollFactor(0)
             .setAlpha(0);

        // Fade in background utama
        this.tweens.add({
            targets: bgTop,
            alpha: 1,
            duration: 1000,
            ease: 'Sine.easeIn'
        });

        // Efek pernapasan lembut pada background (Breathing effect)
        this.tweens.add({
            targets: bgTop,
            scale: scale * 1.03,
            duration: 6000,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
     
        // Judul disesuaikan menjadi Game Berhitung Matematika
        const titleText = this.add.text(
            currentW / 2,
            -200,
            "GAME\nBERHITUNG",
            {
                fontFamily: '"Baloo 2", cursive',
                fontSize: '96px',
                fontStyle: '800',
                color: '#ffffff',
                align: 'center',
                stroke: '#2c2c54',
                strokeThickness: 8,
                shadow: {
                    offsetX: 4,
                    offsetY: 4,
                    color: '#000000',
                    blur: 8,
                    fill: true
                }
            }
        )
        .setOrigin(0.5)
        .setDepth(3)
        .setScale(0)
        .setAlpha(0);

        // Animasi judul drop-down masuk dengan efek memantul elastis
        this.tweens.add({
            targets: titleText,
            y: currentH / 2 - 150,
            scale: 1,
            alpha: 1,
            duration: 1500,
            ease: 'Elastic.out',
            easeParams: [0.6, 0.5],
            onComplete: () => {
                this.tweens.add({
                    targets: titleText,
                    y: '+=8',
                    duration: 1200,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
     
        // Menginisialisasi cetakan struktur popup
        this.createShopPopup(currentW, currentH);
        this.createHelpPopup(currentW, currentH);
     
        // Generator pembentuk interaksi objek tombol menu
        const createButton = (x, y, key, callback) => {
            const btn = this.add.image(x, y, key)
                .setScale(0)
                .setInteractive()
                .setDepth(2);

            btn.on('pointerover', () => {
                btn.setTexture(key + 'Hover');
                this.tweens.add({
                    targets: btn, scale: 0.22, duration: 150, ease: 'Back.out'
                });
            });

            btn.on('pointerout', () => {
                btn.setTexture(key);
                this.tweens.add({
                    targets: btn, scale: 0.2, duration: 150, ease: 'Back.out'
                });
            });

            btn.on('pointerdown', () => {
                playSFX(this, 'sndClick');
                btn.setTexture(key + 'Click');
            });

            btn.on('pointerup', () => {
                btn.setTexture(key);
                if (callback) callback();
            });

            return btn;
        };
     
        const btnY = currentH / 2 + 250;

        const btnHelp = createButton(currentW / 2 - 200, btnY, 'btnHelp', () => {
            this.dimmer.setVisible(true);
            this.helpContainer.setVisible(true).setScale(0);
            this.tweens.add({
                targets: this.helpContainer, scale: 1, duration: 300, ease: 'Back.out'
            });
        });

        const btnPlay = createButton(currentW / 2, btnY, 'btnPlay', () => {
            this.cameras.main.fadeOut(600, 0, 0, 0);
            this.cameras.main.once('camerafadeoutcomplete', () => {
                this.scene.start('Menu');
            });
        });

        const btnShop = createButton(currentW / 2 + 200, btnY, 'btnShop', () => {
            this.shopDimmer.setVisible(true);
            this.shopContainer.setVisible(true).setScale(0);
            this.tweens.add({
                targets: this.shopContainer, scale: 1, duration: 300, ease: 'Back.out'
            });
        }); 
        
        const uiElements = [btnShop, btnPlay, btnHelp];

        // Animasi pop-in untuk deretan menu tombol bawah
        this.tweens.add({
            targets: uiElements,
            scale: 0.2,
            duration: 700,
            ease: 'Back.out',
            delay: this.tweens.stagger(120),
            onComplete: () => {
                this.tweens.add({
                    targets: uiElements,
                    scaleX: 0.205,
                    scaleY: 0.195,
                    duration: 900,
                    yoyo: true,
                    repeat: -1,
                    ease: 'Sine.easeInOut'
                });
            }
        });
    }

    createShopPopup(w, h) {
        this.shopContainer = this.add.container(w / 2, h / 2).setDepth(100).setVisible(false);
        this.shopDimmer = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setDepth(99).setInteractive().setVisible(false);
       
        const panel = this.add.image(0, 0, 'panelLevelSelect').setScale(0.3);
        const adsBox = this.add.rectangle(0, 0, 300, 150, 0x000000, 0.5);
        
        const adsText = this.add.text(0, 0, "ADS", {
            fontSize: '48px', fontFamily: 'Arial', color: '#ffffff', fontStyle: 'bold'
        }).setOrigin(0.5);
        
        const panelHalfWidth = (panel.width * panel.scaleX) / 2;
        const panelHalfHeight = (panel.height * panel.scaleY) / 2;
        
        const btnCancel = this.add.image(-panelHalfWidth + 80, -panelHalfHeight + 80, 'btnCancel').setScale(0.1).setInteractive();
        
        btnCancel.on('pointerover', () => btnCancel.setTexture('btnCancelHover'));
        btnCancel.on('pointerout', () => btnCancel.setTexture('btnCancel'));
        btnCancel.on('pointerdown', () => btnCancel.setTexture('btnCancelClick'));
        btnCancel.on('pointerup', () => {
            btnCancel.setTexture('btnCancel');
            this.shopContainer.setVisible(false);
            this.shopDimmer.setVisible(false);
        });
        
        this.shopContainer.add([panel, adsBox, adsText, btnCancel]);
    }

    createHelpPopup(w, h) {
        this.helpContainer = this.add.container(w / 2, h / 2).setDepth(100).setVisible(false);
        this.dimmer = this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.7).setInteractive().setDepth(99).setVisible(false);
        
        const panel = this.add.image(0, 0, 'panelLevelSelect').setScale(0.3);
        const panelW = panel.width * panel.scaleX;
        const panelH = panel.height * panel.scaleY;

        // Visual header teks popup bantuan
        const titleText = this.add.text(0, -220, "CARA BERMAIN", {
            fontSize: '34px',
            fontFamily: '"Baloo 2", cursive',
            // fontFamily: 'Arial',
            fontStyle: 'bold',
            color: '#ffffff',
            stroke: '#ffffff',
            strokeThickness: 4,
            shadow: {
                offsetX: 1,
                offsetY: 1,
                color: '#000000',
                blur: 5,
                fill: true
            }
        }).setOrigin(0.5);
        
        // Teks panduan permainan asli dari Anda
        const helpInstructions = 
            "1. MODE LATIHAN\n" +
            "Gunakan mode LATIHAN untuk bermain bebas tanpa penilaian.\n\n" +

            "2. MODE LEVEL\n" +
            "Pada mode LEVEL akan ada penilaian dan waktu 2 menit untuk mengerjakan semua soal.\n\n" +

            "3. CARA MENJAWAB\n" +
            "Klik kotak soal lalu pilih jawaban yang benar.\n\n" +

            "4. CEK HASIL\n" +
            "Klik tombol DONE untuk cek jawaban.";
             
        const contentText = this.add.text(-panelW * 0.38, 15, helpInstructions, {
            fontSize: '20px',
            fontFamily: '"Nunito", sans-serif',
            fontStyle: '600',
            color: '#4f4f4f',
            align: 'left',
            lineSpacing: 8,
            wordWrap: {
                width: panelW * 0.76
            }
        }).setOrigin(0, 0.5);
        
        const panelHalfWidth = panelW / 2;
        const panelHalfHeight = panelH / 2;
        
        const btnCancel = this.add.image(-panelHalfWidth + 80, -panelHalfHeight + 80, 'btnCancel').setScale(0.1).setInteractive();
        
        btnCancel.on('pointerover', () => btnCancel.setTexture('btnCancelHover'));
        btnCancel.on('pointerout', () => btnCancel.setTexture('btnCancel'));
        btnCancel.on('pointerdown', () => btnCancel.setTexture('btnCancelClick'));
        btnCancel.on('pointerup', () => {
            btnCancel.setTexture('btnCancel'); 
            this.helpContainer.setVisible(false); 
            this.dimmer.setVisible(false);
        });
        
        this.helpContainer.add([panel, titleText, contentText, btnCancel]);
    }

    update() {}
}