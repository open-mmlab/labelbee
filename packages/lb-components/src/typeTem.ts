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
  pointCloudSwitchPattern,
}: {
  backNode: React.ReactNode;
  headerNameNode: React.ReactNode;
  stepListNode: React.ReactNode;
  headerOptionNode: React.ReactNode;
  langNode: React.ReactNode;
  pointCloudSwitchPattern?: React.ReactNode;
}) => React.ReactNode;
