import React, { useMemo, useCallback } from 'react'
import { Colors, Button, Spinner, Tooltip } from '@blueprintjs/core'
import useSWR, { useSWRInfinite } from 'swr'
import { flatMap } from 'lodash'
import { useSelector } from 'react-redux'
import { ListChildComponentProps } from 'react-window'

import { runCommand } from '@/utils/fetcher'
import { scan } from '@/utils/scanner'
import { Unpacked } from '@/utils/index'
import { formatNumber } from '@/utils/formatter'
import { ConnectionSelector } from '@/components/ConnectionSelector'
import { KeysMatchInput } from '@/components/KeysMatchInput'
import { Panel } from '@/components/panel/Panel'
import { InfiniteList } from '@/components/pure/InfiniteList'
import { ListItems } from '@/components/pure/ListItems'
import { KeyItem } from '@/components/KeyItem'

export default () => {
  const connection = useSelector((state) => state.keys.connection)
  const match = useSelector((state) => state.keys.match)
  const keyType = useSelector((state) => state.keys.keyType)
  const isPrefix = useSelector((state) => state.keys.isPrefix)
  const handleGetKey = useCallback(
    (
      _index: number,
      previousPageData: Unpacked<ReturnType<typeof scan>> | null,
    ) => {
      if (previousPageData?.next === '0') {
        return null
      }
      return connection
        ? [
            connection,
            isPrefix ? `${match}*` : match || '*',
            previousPageData?.next || '0',
            keyType,
          ]
        : null
    },
    [match, connection, keyType, isPrefix],
  )
  const { data, setSize, isValidating, revalidate } = useSWRInfinite(
    handleGetKey,
    scan,
    {
      revalidateOnFocus: false,
    },
  )
  const length = useMemo(
    () => (data ? flatMap(data, (item) => item.keys).length : 0),
    [data],
  )
  const handleLoadMoreItems = useCallback(async () => {
    await setSize((_size) => _size + 1)
  }, [setSize])
  const { data: dbSize, revalidate: revalidateDbSize } = useSWR(
    connection ? `dbsize/${JSON.stringify(connection)}` : null,
    () => runCommand<number>(connection!, ['dbsize']),
  )
  const handleReload = useCallback(async () => {
    await setSize(0)
    await revalidate()
    await revalidateDbSize()
  }, [setSize, revalidate, revalidateDbSize])
  const renderItems = useCallback(
    // eslint-disable-next-line react/jsx-props-no-spreading
    (p: ListChildComponentProps) => <ListItems {...p}>{KeyItem}</ListItems>,
    [],
  )

  return (
    <>
      <div
        style={{
          width: 320,
          padding: 8,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}>
        <KeysMatchInput />
        <div
          style={{
            height: 0,
            flex: 1,
            borderRadius: 4,
            overflow: 'hidden',
          }}>
          {data ? (
            <InfiniteList items={data} onLoadMoreItems={handleLoadMoreItems}>
              {renderItems}
            </InfiniteList>
          ) : null}
        </div>
        <div
          style={{
            height: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: Colors.LIGHT_GRAY4,
            marginTop: 8,
            borderRadius: 4,
            padding: 5,
            userSelect: 'none',
          }}>
          <ConnectionSelector />
          <span>
            {formatNumber(length)}&nbsp;of&nbsp;
            {formatNumber(dbSize || 0)}
          </span>
          {isValidating ? (
            <div style={{ width: 30, cursor: 'not-allowed' }}>
              <Spinner size={16} />
            </div>
          ) : (
            <Tooltip content="Refresh">
              <Button icon="refresh" minimal={true} onClick={handleReload} />
            </Tooltip>
          )}
        </div>
      </div>
      <Panel />
    </>
  )
}
