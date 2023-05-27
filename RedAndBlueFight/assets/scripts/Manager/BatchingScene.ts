import { _decorator, Component, Node, BatchingUtility } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('BatchingScene')
export class BatchingScene extends Component {
    onLoad() {
        BatchingUtility.batchStaticModel(this.node, this.node);
    }
    start() {

    }

    update(deltaTime: number) {

    }
}

