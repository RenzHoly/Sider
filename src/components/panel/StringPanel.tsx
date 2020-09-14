import React, { useCallback } from 'react'
import useSWR from 'swr'
import { useSelector } from 'react-redux'
import bytes from 'bytes'

import { runCommand } from '@/utils/fetcher'
import { Editor } from '../pure/Editor'
import { Footer } from '../pure/Footer'
import { TTLButton } from '../TTLButton'
import { ReloadButton } from '../pure/ReloadButton'
import { HyperLogLog } from './HyperLogLog'

export function StringPanel(props: { value: string }) {
  const connection = useSelector((state) => state.root.connection)
  const { data, revalidate, isValidating } = useSWR(
    connection ? `get/${JSON.stringify(connection)}/${props.value}` : null,
    () => runCommand<string>(connection!, ['get', props.value], true),
  )
  const { data: strlen, revalidate: revalidateStrlen } = useSWR(
    connection ? `strlen/${JSON.stringify(connection)}/${props.value}` : null,
    () => runCommand<number>(connection!, ['strlen', props.value]),
  )
  const handleReload = useCallback(async () => {
    await revalidate()
    await revalidateStrlen()
  }, [revalidate, revalidateStrlen])
  const isHyperLogLog = data?.startsWith('HYLL')

  return (
    <div
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
      }}>
      {isHyperLogLog ? (
        <HyperLogLog value={props.value} />
      ) : (
        <Editor style={{ flex: 1 }} value={data} />
      )}
      <Footer>
        <TTLButton style={{ flexBasis: 80 }} value={props.value} />
        {bytes(strlen || 0, { unitSeparator: ' ' })}
        <ReloadButton
          style={{ flexBasis: 80, display: 'flex', justifyContent: 'flex-end' }}
          isLoading={isValidating}
          onReload={handleReload}
        />
      </Footer>
    </div>
  )
}
