import { useContext } from 'react';
import { useDispatch } from '@/store/ctx';
import { useSingleBox } from './useSingleBox';
import { PointCloudContext } from '../PointCloudContext';
import { EPointCloudName } from '@labelbee/lb-annotation';
import { IPointCloudBox, IPointCloudSphere } from '@labelbee/lb-utils';
import { PreDataProcess } from '@/store/annotation/actionCreators';
import { usePointCloudViews } from './usePointCloudViews';
import { useSphere } from './useSphere';
import { useHistory } from './useHistory';
import { EPointCloudBoxRenderTrigger } from '@/utils/ToolPointCloudBoxRenderHelper';

const PointCloudView = {
  '3D': '3D',
  Top: 'Top',
  Side: 'Side',
  Back: 'Back',
};

const useUpdatePointCloudColor = (setResourceLoading: any, config: any) => {
  const ptCtx = useContext(PointCloudContext);
  const { topViewInstance, selectedIDs, pointCloudBoxList, mainViewInstance, selectedID } = ptCtx;
  const dispatch = useDispatch();
  const { selectedSphere } = useSphere();
  const { syncPointCloudViews, syncPointCloudPoint, generateRects } = usePointCloudViews({
    setResourceLoading,
  });
  const { selectedBox, updateSelectedBox } = useSingleBox({
    generateRects,
  });
  const { pushHistoryWithList } = useHistory();

  const updateSelectedSphere = ({
    newSelectedSphere,
    newSphereList,
  }: {
    newSelectedSphere?: IPointCloudSphere;
    newSphereList?: IPointCloudSphere[];
  }) => {
    const operation = topViewInstance?.toolInstance;
    if (newSelectedSphere || selectedSphere) {
      if (selectedIDs.length === 1) {
        const sphereParams = newSelectedSphere ?? selectedSphere;
        operation.setSelectedID(selectedIDs[0]);
        const point = operation.selectedPoint;
        if (sphereParams) {
          syncPointCloudPoint?.(
            PointCloudView.Top,
            point,
            sphereParams,
            undefined,
            newSphereList,
            config,
          );
        }
      }
    }
  };

  const topViewSelectedChanged = ({
    trigger,
    newSelectedBox,
  }: {
    trigger: EPointCloudBoxRenderTrigger;
    newSelectedBox?: IPointCloudBox;
  }) => {
    const operation = topViewInstance?.toolInstance;
    if (selectedIDs.length === 0 || !operation) {
      return;
    }
    if (newSelectedBox || selectedBox?.info) {
      const boxParams = newSelectedBox ?? selectedBox?.info;
      const polygon = newSelectedBox;
      if (boxParams) {
        syncPointCloudViews?.(
          {
            omitView: PointCloudView.Top,
            polygon,
            boxParams,
          },
          trigger,
        );
        return;
      }
    }
  };

  const updatePointCloudColor = (newAttribute: string) => {
    pointCloudBoxList.forEach((selectBox) => {
      if (selectBox && selectedIDs.includes(selectBox.id)) {
        selectBox.attribute = newAttribute;

        const nextResult = dispatch(
          PreDataProcess({
            tool: EPointCloudName.PointCloud,
            dataList: [selectBox],
            stepConfig: config,
            action: 'viewUpdateBox',
          }),
        ) as unknown as IPointCloudBox[];

        selectBox.valid = nextResult[0].valid;

        updateSelectedBox(selectBox);

        ptCtx?.topViewInstance?.pointCloud2dOperation?.setPolygonValidAndRender?.(
          selectBox.id,
          true,
          selectBox.valid,
        );
        // Retain the original logic of updating the sphere and detach the logic of updating the point cloud to reduce the number of updates
        updateSelectedSphere({});
      }
    });

    // Extract the original update logic, merge and integrate, and reduce the number of point cloud updates to once
    if (mainViewInstance) {
      const trigger =
        selectedIDs && selectedIDs.length > 1
          ? EPointCloudBoxRenderTrigger.MulitSelect
          : EPointCloudBoxRenderTrigger.Single;
      // Update all view related colors first
      ptCtx.syncAllViewPointCloudColor(trigger, pointCloudBoxList);
      /**
       * Update the relevant content of the original point cloud again
       * This method maintains the same judgment logic as the original topViewSlectedChanged, and only triggers an update when one box is selected
       */
      if (selectedIDs && selectedIDs.length === 1) {
        const newSelectedBox = pointCloudBoxList.find((item) => item.id === selectedIDs[0]);
        topViewSelectedChanged({
          trigger,
          newSelectedBox,
        });
      }
      mainViewInstance.generateBoxes(pointCloudBoxList);
    }

    /**
     * When making multiple selections, update the history. Originally, there was no logic for multiple selections to update the history,
     * The single choice update history logic is in the updateSelectedBox method, which updates the history based on the judgment of selectedBox. It only takes effect when there is a single choice, as selectedID will be cleared when there is a multiple choice
     * */
    if (!selectedID) {
      pushHistoryWithList({
        pointCloudBoxList: pointCloudBoxList,
      });
    }
  };

  return {
    updatePointCloudColor,
  };
};

export { useUpdatePointCloudColor };
