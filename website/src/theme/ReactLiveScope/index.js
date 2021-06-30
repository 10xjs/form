import React from 'react';

import * as form from '@10xjs/form/lib';

const ReactLiveScope = {
  ...form,
  React,
  ...React,
};

export default ReactLiveScope;
