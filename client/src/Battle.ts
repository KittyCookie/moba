class Battle extends egret.DisplayObjectContainer {
    public static myName: string;
    
    private roomList: RoomList;
    private roomCount: number;
    private roomService: string;
    
    private net: Net;
    
    private playerGroup: PlayerGroup;
    
    private currentRoomText: egret.TextField;
    private battleStatusText: egret.TextField;
    
	public constructor() {
        super();
        
        MessageCenter.battle = this;

        this.initPlayers();
        this.net = new Net(this);
        this.addChild(this.net);
        Battle.myName = this.net.connect();
        
        this.initCurrentRoomText();
        this.initBattleStatusText();
	}
	
	private initCurrentRoomText():void {
        this.currentRoomText = new egret.TextField();
        this.currentRoomText.text = "";
	}
	
	private initBattleStatusText():void {
        this.battleStatusText = new egret.TextField();
        this.battleStatusText.x = 200;
        this.battleStatusText.y = 50;
        this.battleStatusText.text = "waiting";
	}
	
    private initPlayers(): void {
        this.playerGroup = new PlayerGroup();
    }
	
	public switchToHall(roomInfos:any):void {
        if(this.currentRoomText.parent) {
            this.currentRoomText.parent.removeChild(this.currentRoomText);
        }
        if(this.battleStatusText.parent) {
            this.battleStatusText.parent.removeChild(this.battleStatusText);
        }
    	  if(this.playerGroup.parent) {
            this.playerGroup.parent.removeChild(this.playerGroup);
        }
             
        this.roomCount = Object.keys(roomInfos).length;
        this.roomList = new RoomList(this, roomInfos);
        this.addChild(this.roomList);
   	}
	
	public switchToRoom(service:string) {
        if(this.roomList.parent) {
            this.roomList.parent.removeChild(this.roomList);
        }
        
        this.setRoomService(service);
        
        this.currentRoomText.text = this.roomService;
        this.addChild(this.currentRoomText);
        this.addChild(this.battleStatusText);
        this.addChild(this.playerGroup);
        
        this.stage.addEventListener(egret.TouchEvent.TOUCH_TAP, this.shootOrMove, this);
	}
	
    private shootOrMove(event:egret.TouchEvent):void {
        var isShoot: boolean = false;
        this.playerGroup.iteratorPlayers(function(target: any) {
            if(target.name != Battle.myName) {
                if(Math.abs(target.x - event.stageX) < Player.tankOffset
                    && Math.abs(target.y - event.stageY) < Player.tankOffset) {
                    MessageCenter.send({ Service: MessageCenter.battle.getRoomService(),Type: "shoot",Data: target.name });
                    isShoot = true;//点击到其他坦克的区域则视为攻打坦克
                }
            }          
        });
        //没有攻打到坦克，则移动.已阵亡的玩家不再移动
        if(!isShoot && this.playerGroup.isMyselfAlive()){
            MessageCenter.send({ Service: MessageCenter.battle.getRoomService(),Type: "move",Data: event.stageX + ',' + event.stageY});
        }
    }
	
	public getRoomCount():number {
        return this.roomCount;
	}
	
	public setBattleStatus(status:string):void {
        this.battleStatusText.text = status;
	}
	
	public setRoomService(service:string):void {
        this.roomService = service;
	}
	
	public getRoomService():string {
        return this.roomService;
	}
	
	public getPlayerGroup():PlayerGroup {
        return this.playerGroup;
	}
}
