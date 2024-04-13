"use client"

import React, { useEffect, useState } from 'react';
import Input from '../ui/Input/Input';
import IconSearch from '../svg/Search';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import IconClose from '../svg/Close';

function SearchInput () {
    const query = useSearchParams()
    const searchQuery = query.get("search")
    const pathname = usePathname()
    const [searchValue, setSearchValue] = useState<string>(searchQuery || "")

    const search = () => {
        if (searchValue) {
            window.history.replaceState(null, "", pathname + `?search=${searchValue}`)
        }
    }

    const reset = () => {
        if (searchValue && searchQuery) {
            window.history.replaceState(null, "", pathname)
            setSearchValue("")
        }
    }

    useEffect(() => {
        if (!searchValue) {
            window.history.replaceState(null, "", pathname)
        }
    }, [searchValue])

    return <Input
    before={<IconSearch width={16} />}
    after={searchQuery && searchValue && <IconClose width={16} onClick={reset} className='absolute right-[16px]'/>}
    placeholder="Search"
    width={"300px"}
    value={searchValue}
    onInput={(e: any) => {setSearchValue(e.target.value.trim())}}
    onEnterPress={() => {search()}}
  />
}

export default SearchInput