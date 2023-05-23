/**
 * @file PointCloud FSM.
 * @createdate 2023-05-16
 * @author Ron <ron.f.luo@gmail.com>
 */

import { EPointCloudSegmentStatus } from '@labelbee/lb-utils';

class PointCloudFSM {
  public segmentStatus = EPointCloudSegmentStatus.Ready;

  /**
   * Toggle status to next status.
   */
  public statusToggle() {
    switch (this.segmentStatus) {
      case EPointCloudSegmentStatus.Ready:
        this.segmentStatus = EPointCloudSegmentStatus.Check;
        break;

      case EPointCloudSegmentStatus.Check:
        this.segmentStatus = EPointCloudSegmentStatus.Edit;

        break;
      case EPointCloudSegmentStatus.Edit:
        this.segmentStatus = EPointCloudSegmentStatus.Ready;
        break;

      default: {
        console.error('Error Status in PointCloudSegmentFSM');
      }
    }
  }

  public updateStatus2Edit() {
    this.segmentStatus = EPointCloudSegmentStatus.Edit;
  }

  public updateStatus2Check() {
    this.segmentStatus = EPointCloudSegmentStatus.Check;
  }

  public updateStatus2Ready() {
    this.segmentStatus = EPointCloudSegmentStatus.Ready;
  }

  public get isReadyStatus() {
    return this.segmentStatus === EPointCloudSegmentStatus.Ready;
  }

  public get isCheckStatus() {
    return this.segmentStatus === EPointCloudSegmentStatus.Check;
  }

  public get isEditStatus() {
    return this.segmentStatus === EPointCloudSegmentStatus.Edit;
  }
}

const instance = new PointCloudFSM();

export default instance;
