import React from 'react';
import { Button } from '@material-ui/core';
import { v1 as uuid } from 'uuid';

const CreateRoom = props => {
  const create = () => {
    const id = uuid();
    props.history.push(`/room/${id}`);
  };

  return <Button onClick={create}>Create room</Button>;
};

export default CreateRoom;
