import { Canvas, macro, Mat4, size, Vec3, view, Node } from "cc";


export default class Tools {

    public static platform: string;

    static showToast(message: string) {
        switch (Tools.platform) {
            case "qg":
                window["qg"].showToast({
                    message: message
                });
                break;
            case "qq":
                window["qq"].showToast({
                    title: message
                });
                break;
            case "ks":
                window["ks"].showToast({
                    title: message,
                    icon: "none"
                })
                break;
            case "tt":
                window["tt"].showToast({
                    title: message,
                    icon: "none"
                })
                break;
            default:
                break;
        }
    }

    static getPlatformInfo() {
        if (window["qq"]) {
            Tools.platform = "qq";
            console.log("qq平台");
        }
        if (window["qg"]) {
            Tools.platform = "qg";
            console.log("vivo平台");
        }
        if (window["ks"]) {
            Tools.platform = "ks";
            console.log("快手平台");
        }
        if (window["tt"]) {
            Tools.platform = "tt";
            console.log("头条平台");
        }
    }

    static shuffle(array) {
        let j, x, i;
        for (i = array.length; i; i--) {
            j = Math.floor(Math.random() * i);
            x = array[i - 1];
            array[i - 1] = array[j];
            array[j] = x;
        }
        return array;
    }

    static deepCopy(array) {
        if (array.length <= 0) {
            return;
        }
        return [].concat(JSON.parse(JSON.stringify(array)))
    }

    static getRandomNum(min: number, max: number) {
        let range = Math.abs(max - min);
        let rand = Math.random();

        return (Math.round(min) + Math.round(rand * range));
    }

    static getRandomNumContact(min: number, max: number) {
        let range = Math.abs(max - min) + 1;
        let random = Math.floor(Math.random() * range) + Math.min(min, max);
        return random;
    }

    // 去除字符串中的所有空格
    static trim2(str: string) {
        const reg = /\s+/g;
        return str.replace(reg, '');
    }


    static splitGroup(list, count) {
        if (list.length < 0 || list.length < count) {
            return;
        }
        let group = [];
        for (let i = 0; i < count; i++) {
            group[i] = [];
        }

        let countIndex = 0;

        while (countIndex < count) {
            for (let i = 0; i < count; i++) {
                if (list[i * count + countIndex] == undefined) {
                    break;
                }
                group[i].push(list[i * count + countIndex]);
            }
            countIndex++;
        }
        return group;
    }

    // 3D 节点 nodeB 本地坐标转换到 3D 节点 nodeA 本地坐标
    static convertToNodePos(nodeA: Node, nodeB: Node) {
        let tempPos = new Vec3();
        let tempMat4 = new Mat4();
        Mat4.invert(tempMat4, nodeA.getWorldMatrix());
        Vec3.transformMat4(tempPos, nodeB.worldPosition, tempMat4);
        return tempPos;
    }

    //找到距离目标节点最近的节点
    static findClosestNode(targetNode: Node, nodeArray: Node[]) {
        if (nodeArray.length === 0) {
            return null;
        }
        let minDistance = Vec3.subtract(new Vec3(), targetNode.position, nodeArray[0].position).length();
        let closestNode = nodeArray[0];

        for (let i = 1; i < nodeArray.length; i++) {
            let distance = Vec3.subtract(new Vec3(), targetNode.position, nodeArray[i].position).length();
            if (distance < minDistance) {
                minDistance = distance;
                closestNode = nodeArray[i];
            }
        }

        return closestNode;
    }
}
