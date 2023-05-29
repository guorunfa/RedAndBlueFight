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
    public static prefab_red_people_gun_0: Prefab;

    public static prefab_effect_boom_1: Prefab;
    public static prefab_effect_boom_2: Prefab;
    public static prefab_effect_boom_3: Prefab;
    public static prefab_effect_fire: Prefab;
    public static prefab_effect_fire_blue: Prefab;
    public static prefab_effect_fire_red: Prefab;

    public static loadPrefabs() {
        resources.loadDir("prefabs/effects", Prefab, (err, assets: Prefab[]) => {
            this.prefab_effect_boom_1 = assets.find((prefab) => {
                return prefab.name == "boom_1";
            })
            this.prefab_effect_boom_2 = assets.find((prefab) => {
                return prefab.name == "boom_2";
            })
            this.prefab_effect_boom_3 = assets.find((prefab) => {
                return prefab.name == "boom_3";
            })
            this.prefab_effect_fire = assets.find((prefab) => {
                return prefab.name == "fire";
            })
            this.prefab_effect_fire_blue = assets.find((prefab) => {
                return prefab.name == "fire_blue";
            })
            this.prefab_effect_fire_red = assets.find((prefab) => {
                return prefab.name == "fire_red";
            })

            resources.loadDir("prefabs/roles", Prefab, (err, assets: Prefab[]) => {
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
                this.prefab_red_people_gun_0 = assets.find((prefab) => {
                    return prefab.name == "red_people_gun_0";
                })

                console.log("资源加载完成-------------------------------");
                game.emit("prefabsLoaded");
            })
        })
    }
}

