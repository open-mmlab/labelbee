import { useCallback, useContext, useMemo } from 'react';
import { PointCloudContext } from '@/components/pointCloudView/PointCloudContext';
import _ from 'lodash';
import { useHistory } from '@/components/pointCloudView/hooks/useHistory';

export const useSphere = () => {
  const {
    pointCloudSphereList,
    setPointCloudSphereList,
    selectedID,
    mainViewInstance,
  } = useContext(PointCloudContext);

  const { pushHistoryWithList } = useHistory();

  const selectedSphere = useMemo(() => {
    return pointCloudSphereList.find((v) => v.id === selectedID)
  }, [selectedID, pointCloudSphereList])

  const getPointCloudSphereByID = useCallback(
    (id: string) => {
      return pointCloudSphereList.find((i) => i.id === id);
    },
    [pointCloudSphereList],
  );

  const updatePointCloudSphere = useCallback(
    (sphereParams) => {
      const sphereIndex = pointCloudSphereList.findIndex((v) => v.id === sphereParams.id)
      if (sphereIndex > -1) {
        pointCloudSphereList.splice(sphereIndex, 1, _.merge(pointCloudSphereList[sphereIndex], sphereParams));
        const newPointCloudSphereList = _.cloneDeep(pointCloudSphereList);
        setPointCloudSphereList(newPointCloudSphereList);
        pushHistoryWithList({ pointCloudSphereList: newPointCloudSphereList });
        return newPointCloudSphereList;
      }
      return pointCloudSphereList
    }, [pointCloudSphereList]
  )

  const deletePointCloudSphere = useCallback(
    (id: string) => {
      const newPointCloudSphereList = pointCloudSphereList.filter((v) => v.id !== id);
      setPointCloudSphereList(newPointCloudSphereList);
      mainViewInstance?.removeObjectByName(id);
      mainViewInstance?.render();
    }, [pointCloudSphereList]
  )

  return {
    selectedSphere,
    getPointCloudSphereByID,
    updatePointCloudSphere,
    deletePointCloudSphere,
  }
}
