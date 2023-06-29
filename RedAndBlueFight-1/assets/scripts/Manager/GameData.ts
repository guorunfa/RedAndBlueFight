import { _decorator, Component, Node } from 'cc';
import { Base } from '../Role/Base';
import { PeopleGun } from '../Role/PeopleGun';
import { User } from '../User';
import { TEAM } from './GameManager';


export class GameData {
    private static _instance: GameData = null;

    redTeam: any;

    blueTeam: any;

    users: User[];

    public static getInstance() {
        if (!this._instance) {
            this._instance = new GameData();
        }
        return this._instance;
    }

    init(redbase: Node, blueBase: Node) {
        this.users = [];
        this.redTeam = {
            base: redbase,
            roles: []
        };
        this.blueTeam = {
            base: blueBase,
            roles: []
        };
        this.redTeam.base.getComponent(Base).init();
        this.blueTeam.base.getComponent(Base).init();
    }

    removeRoleFromTeam(role: Node, team: TEAM) {
        let roles = team == TEAM.RED ? this.redTeam.roles : this.blueTeam.roles;
        console.log("当前角色数量：", roles.length);
        let index = roles.indexOf(role);
        if (index != -1) {
            roles.splice(index, 1);
        }
        console.log("从队列中移除一个role：", roles.length);
    }

    gameOver() {
        if (this.redTeam.roles.length > 0) {
            for (let role of this.redTeam.roles) {
                role.getComponent(PeopleGun).die();
            }
        }

        if (this.blueTeam.roles.length > 0) {
            for (let role of this.blueTeam.roles) {
                role.getComponent(PeopleGun).die();
            }
        }
    }
}


