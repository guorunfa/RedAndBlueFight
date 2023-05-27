import { _decorator, Component, Node, Prefab, resources, Game, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PrefabManager')
export class PrefabManager {
    public static prefab_blue_people_gun: Prefab;
    public static prefab_blue_people_rpg: Prefab;
    public static prefab_blue_people_fly: Prefab;
    public static prefab_blue_people_shield: Prefab;
    public static prefab_blue_tank: Prefab;
    public static prefab_blue_airplane: Prefab;
    public static prefab_red_people_gun: Prefab;
    public static prefab_red_people_rpg: Prefab;
    public static prefab_red_people_fly: Prefab;
    public static prefab_red_people_shield: Prefab;
    public static prefab_red_tank: Prefab;
    public static prefab_red_airplane: Prefab;

    public static loadPrefabs() {
        resources.loadDir("prefabs", Prefab, (err, assets: Prefab[]) => {
            this.prefab_blue_people_gun = assets.find((prefab) => {
                return prefab.name == "blue_people_gun";
            })
            this.prefab_blue_people_rpg = assets.find((prefab) => {
                return prefab.name == "blue_people_rpg";
            })
            this.prefab_blue_people_fly = assets.find((prefab) => {
                return prefab.name == "blue_people_fly";
            })
            this.prefab_blue_people_shield = assets.find((prefab) => {
                return prefab.name == "blue_people_shield";
            })
            this.prefab_blue_tank = assets.find((prefab) => {
                return prefab.name == "blue_tank";
            })
            this.prefab_blue_airplane = assets.find((prefab) => {
                return prefab.name == "blue_airplane";
            })
            this.prefab_red_people_gun = assets.find((prefab) => {
                return prefab.name == "red_people_gun";
            })
            this.prefab_red_people_rpg = assets.find((prefab) => {
                return prefab.name == "red_people_rpg";
            })
            this.prefab_red_people_fly = assets.find((prefab) => {
                return prefab.name == "red_people_fly";
            })
            this.prefab_red_people_shield = assets.find((prefab) => {
                return prefab.name == "red_people_shield";
            })
            this.prefab_red_tank = assets.find((prefab) => {
                return prefab.name == "red_tank";
            })
            this.prefab_red_airplane = assets.find((prefab) => {
                return prefab.name == "red_airplane";
            })
            game.emit("prefabsLoaded");
        })
    }
}

