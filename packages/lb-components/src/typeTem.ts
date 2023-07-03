/**
 * Temporary use, for external access
 */

import React from 'react';

export type Header = ({
  backNode,
  headerNameNode,
  stepListNode,
  headerOptionNode,
  langNode,
  PointCloudSwitchPattern,
}: {
  backNode: React.ReactNode;
  headerNameNode: React.ReactNode;
  stepListNode: React.ReactNode;
  headerOptionNode: React.ReactNode;
  langNode: React.ReactNode;
  PointCloudSwitchPattern?: React.ReactNode;
}) => React.ReactNode;
