import { w, h, cx, cy, setGameSize, playSFX } from './Utils/global.js';

export class HistoryScene extends Phaser.Scene {

    constructor() {
        super('HistoryScene');
    }

    preload() {
        this.load.image('panelPaused', 'assets/panelPaused.png');
        this.load.image('panelSmallHistory', 'assets/panelSmallHistory.png');
        this.load.image('verticalScrolling', 'assets/verticalScrolling.png');
        this.load.image('btnUpDown', 'assets/btnUpDown.png');
        this.load.image('bgGame', 'assets/bgGame.png');
        this.load.image('btnLeft', 'assets/btnLeft.png');
        this.load.image('btnLeftHover', 'assets/btnLeftHover.png');
        this.load.image('btnLeftClick', 'assets/btnLeftClick.png');
        this.load.audio('sndClick', 'assets/audio/click.mp3');
    }

    create() {
        const currentW = this.game.canvas.width;
        const currentH = this.game.canvas.height;
        const currentCx = currentW / 2;
        const currentCy = currentH / 2;
        
        const bg = this.add.image(currentCx, currentCy, 'bgGame').setDepth(-1);
        const scaleX = currentW / bg.width;
        const scaleY = currentH / bg.height;
        const scale = Math.max(scaleX, scaleY);
        bg.setScale(scale).setScrollFactor(0);
        
        this.add.rectangle(currentCx, currentCy, currentW, currentH, 0x000000, 0.6);
        
        const mainPanel = this.add.image(currentCx, currentCy, 'panelPaused').setScale(0.3);
        
        const title = this.add.text(currentCx, currentCy - 320, "HISTORY LATIHAN", {
            fontSize: '42px',
            fontFamily: 'Arial',
            fontStyle: 'bold',
            fill: '#ffffff',
            stroke: '#708090',
            strokeThickness: 6
        }).setOrigin(0.5);
        
        const btnBack = this.add.image(80, 80, 'btnLeft').setScale(0.1).setInteractive();
        btnBack.on('pointerover', () => btnBack.setTexture('btnLeftHover'));
        btnBack.on('pointerout', () => btnBack.setTexture('btnLeft'));
        btnBack.on('pointerdown', () => { btnBack.setTexture('btnLeftClick'); playSFX(this, 'sndClick'); });
        btnBack.on('pointerup', () => { 
            btnBack.setTexture('btnLeft'); 
            this.scene.start('Menu'); 
        });
        
        let historyData = [];
        try {
            const raw = localStorage.getItem('mathGame_practiceHistory');
            if (raw) {
                historyData = JSON.parse(raw);
                historyData.reverse();
            }
        } catch (e) {
            console.error("error menampilkan history", e);
        }
        
        const listWidth = 500;
        const listHeight = 430;
        const listX = currentCx - 300;
        const listY = currentCy - 240;
        
        this.listContainer = this.add.container(listX, listY);
        
        let emptyTxt;
        if (historyData.length === 0) {
            emptyTxt = this.add.text(300, 200, "Belum ada data permainan.", {
                fontSize: '24px', color: '#333', fontFamily: 'Arial'
            }).setOrigin(0.5).setAlpha(0);
            this.listContainer.add(emptyTxt);
        } else {
            this.createListItems(historyData);
        }
        
        const maskShape = this.make.graphics();
        maskShape.fillStyle(0xffffff);
        maskShape.fillRect(listX, listY, listWidth, listHeight);
        
        const mask = new Phaser.Display.Masks.GeometryMask(this, maskShape);
        this.listContainer.setMask(mask);
        
        const scrollX = currentCx + 260;
        const scrollY = currentCy - 20;
        const scrollBarTrack = this.add.image(scrollX, scrollY, 'verticalScrolling');
        scrollBarTrack.setDisplaySize(20, listHeight);
        
        this.scrollThumb = this.add.image(scrollX, listY + 20, 'btnUpDown').setScale(0.4).setInteractive();
        
        this.scrollMinY = listY + 20;
        this.scrollMaxY = listY + listHeight - 20;
        this.scrollRange = this.scrollMaxY - this.scrollMinY;
        
        this.contentHeight = Math.max(historyData.length * 110, listHeight);
        this.contentMaxY = 0;
        this.contentMinY = listHeight - this.contentHeight;
        
        if (this.contentHeight <= listHeight) {
            scrollBarTrack.setVisible(false);
            this.scrollThumb.setVisible(false);
        }
        
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            this.listContainer.y -= deltaY * 0.5;
            this.clampScroll(currentCy);
            this.updateThumbPosition(currentCy);
        });
        
        this.input.setDraggable(this.scrollThumb);
        this.scrollThumb.on('drag', (pointer, dragX, dragY) => {
            this.scrollThumb.y = Phaser.Math.Clamp(dragY, this.scrollMinY, this.scrollMaxY);
            const percent = (this.scrollThumb.y - this.scrollMinY) / this.scrollRange;
            this.listContainer.y = listY + (this.contentMinY * percent);
        });
        
        mainPanel.setScale(0); 
        this.tweens.add({
            targets: [mainPanel, title],
            scale: (target) => target === mainPanel ? 0.3 : 1,
            duration: 600,
            ease: 'Elastic.out',
            easeParams: [0.5, 1.5]
        });
        
        scrollBarTrack.setAlpha(0);
        this.scrollThumb.setAlpha(0);
        this.tweens.add({
            targets: [scrollBarTrack, this.scrollThumb, emptyTxt],
            alpha: 1,
            duration: 500,
            delay: 100
        });
    }

    createListItems(data) {
        const itemGap = 110;
        const items = [];
        
        data.forEach((record, index) => {
            const yPos = 55 + (index * itemGap);
            const rowContainer = this.add.container(300, yPos);
            const bgItem = this.add.image(0, 0, 'panelSmallHistory').setDisplaySize(360, 105);
            
            let opSymbol = record.operation;
            if (opSymbol === 'tambah') opSymbol = '(+)';
            else if (opSymbol === 'kurang') opSymbol = '(-)';
            else if (opSymbol === 'kali') opSymbol = '(x)';
            else if (opSymbol === 'bagi') opSymbol = '(:)';
            
            const d = new Date(record.date);
            const dateStr = `${d.getDate()}/${d.getMonth() + 1} ${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
        
            const styleLabel = { fontSize: '14px', color: '#555555', fontStyle: 'bold', fontFamily: 'Arial' };
            const styleValue = { fontSize: '18px', color: '#000000', fontStyle: 'bold', fontFamily: 'Arial' };
            
            const txtDate = this.add.text(-160, -20, dateStr, styleLabel).setOrigin(0, 0.5);
            const txtOp = this.add.text(-160, 15, `Mode:${opSymbol}`, styleValue).setOrigin(0, 0.5);
            const txtRange = this.add.text(-50, -20, `Range: ${record.range}`, styleLabel).setOrigin(0, 0.5);
            const txtTime = this.add.text(-50, 15, `${record.timeBox}`, styleValue).setOrigin(0, 0.5);
            
            let scoreColor = '#000000';
            if (record.score.startsWith('16/16')) scoreColor = '#008800';
            
            const txtScoreLabel = this.add.text(110, -20, "SCORE", styleLabel).setOrigin(0.5);
            const txtScore = this.add.text(110, 15, record.score, {
                fontSize: '28px', color: scoreColor, fontStyle: 'bold', fontFamily: 'Arial'
            }).setOrigin(0.5);
            
            rowContainer.add([bgItem, txtDate, txtOp, txtRange, txtTime, txtScoreLabel, txtScore]);
            
            if (record.score.startsWith('16/16')) {
                this.tweens.add({
                    targets: txtScore, scale: 1.05, duration: 800, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' 
                });
            }
            
            rowContainer.setAlpha(0);
            rowContainer.x += 100;
            items.push(rowContainer);
            this.listContainer.add(rowContainer);
        });

        this.tweens.add({
            targets: items, alpha: 1, x: 300, duration: 500, ease: 'Back.out', delay: this.tweens.stagger(100)
        });
    }

    clampScroll(cy) {
        const startY = cy - 160;
        const minY = startY + this.contentMinY;
        const maxY = startY + this.contentMaxY;
        this.listContainer.y = Phaser.Math.Clamp(this.listContainer.y, minY, maxY);
    }

    updateThumbPosition(cy) {
        if (this.contentHeight <= 400 || this.contentMinY === 0) return;
        const startY = cy - 160;
        const currentOffset = this.listContainer.y - startY;
        const percent = currentOffset / this.contentMinY;
        this.scrollThumb.y = this.scrollMinY + (percent * this.scrollRange);
    }

    update() {}
}