import { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Button } from '@blueprintjs/core'
import { Tooltip2 } from '@blueprintjs/popover2'

import { actions } from '@/stores'
import { MatchInput } from '../pure/MatchInput'

export function SetMatchInput() {
  const match = useSelector((state) => state.set.match)
  const isPrefix = useSelector((state) => state.set.isPrefix)
  const dispatch = useDispatch()
  const handleMatchChange = useCallback(
    (_match: string) => {
      dispatch(actions.set.setMatch(_match))
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
      rightElement={
        <Tooltip2
          boundary={window.document.body}
          content={`Prefix match: ${isPrefix ? 'ON' : 'OFF'}`}>
          <Button
            icon="asterisk"
            minimal={true}
            active={isPrefix}
            onClick={() => {
              dispatch(actions.set.setIsPrefix(!isPrefix))
            }}
          />
        </Tooltip2>
      }
    />
  )
}
