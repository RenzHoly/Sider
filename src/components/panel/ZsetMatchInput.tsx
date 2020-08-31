import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Tooltip, Icon } from '@blueprintjs/core'

import { actions } from '@/stores'
import { MatchInput } from '../pure/MatchInput'

export function ZsetMatchInput() {
  const match = useSelector((state) => state.zset.match)
  const isPrefix = useSelector((state) => state.zset.isPrefix)
  const dispatch = useDispatch()
  const handleMatchChange = useCallback(
    (_match: string) => {
      dispatch(actions.zset.setMatch(_match))
    },
    [dispatch],
  )

  return (
    <MatchInput
      value={match}
      onChange={handleMatchChange}
      style={{
        marginBottom: 8,
      }}
      leftElement={<Icon icon="search" />}
      rightElement={
        <Tooltip content="Prefix match">
          <Button
            icon="asterisk"
            minimal={true}
            active={isPrefix}
            onClick={() => {
              dispatch(actions.zset.setIsPrefix(!isPrefix))
            }}
          />
        </Tooltip>
      }
    />
  )
}