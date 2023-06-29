import { _decorator, Component, Node } from 'cc';
import { Base } from '../Role/Base';
import { User } from '../User';
import { TEAM } from './GameManager';


export class GameData {
    private static _instance: GameData = null;

    redTeam: {
        base: Base,
        roles: any[]
    }

    blueTeam: {
        base: Base,
        roles: any[]
    }

    users: User[];

    public static getInstance() {
        if (!this._instance) {
            this._instance = new GameData();
        }
        return this._instance;
    }

    init(baseRed: Node, baseBlue: Node) {
        this.users = [];
        this.redTeam = {
            base: new Base(TEAM.RED, baseRed),
            roles: []
        };
        this.blueTeam = {
            base: new Base(TEAM.BLUE, baseBlue),
            roles: []
        };
    }

    removeRoleFromTeam(role: any, team: TEAM) {
        let roles = team == TEAM.RED ? this.redTeam.roles : this.blueTeam.roles;
        console.log("当前角色数量：", roles.length);
        let index = roles.indexOf(role);
        if (index != -1) {
            roles.splice(index, 1);
        }
        console.log("从队列中移除一个role：", roles.length);
    }

    gameOver() {
        if (this.redTeam && this.redTeam.roles.length > 0) {
            for (let role of this.redTeam.roles) {
                role.die();
            }
        }

        if (this.blueTeam && this.blueTeam.roles.length > 0) {
            for (let role of this.redTeam.roles) {
                role.die();
            }
        }
    }
}


