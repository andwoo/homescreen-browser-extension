import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';
import SimpleBar from 'simplebar-react';
import $ from 'jquery';
import { BlockColumnProps } from './BlockColumn';
import Box from '../styled/Box';
import * as StyleConstants from '../styled/StyleConstants';
import MediaTile from './MediaTile';

interface Match {
  teamOne: string;
  teamTwo: string;
  isLive: boolean;
  time: string;
  thumbnail: string;
  href: string;
}

const ValorantColumn = ({ block, isLoading, setLoading, isSuccess, setSuccess }: BlockColumnProps): JSX.Element => {
  const [matches, setMatches] = useState([]);
  const fetchData = useCallback(async (): Promise<void> => {
    setSuccess(false);
    setLoading(true);
    try {
      const response = await axios.get('https://www.vlr.gg/matches', { responseType: 'text' });
      let html: JQuery<HTMLElement> = $('<div>').html(response.data);
      //@ts-ignore
      html = await html.ready();
      setMatches(Array.from(html[0].getElementsByClassName("match-item")).map((element: Element) => {
        const thumbnail = element.getElementsByClassName("match-item-icon")[0].getElementsByTagName("img")[0].getAttribute("src");
        console.log(thumbnail);
        const time = element.getElementsByClassName("ml-eta")?.[0]?.textContent?.trim();
        const isLive = element.getElementsByClassName("ml-status")?.[0]?.textContent?.trim()?.toLowerCase?.() === 'live';
        const teams = Array.from(element.getElementsByClassName("match-item-vs")[0].getElementsByClassName("match-item-vs-team")).map((element: Element) => element.getElementsByClassName("text-of")[0].textContent.trim());

        return {
          teamOne: teams[0],
          teamTwo: teams[1],
          thumbnail: thumbnail.includes('//') ? `https:${thumbnail}` : `https://www.vlr.gg${thumbnail}`,
          isLive: isLive,
          time: time ?? "TBD",
          href: `https://www.vlr.gg${element.getAttribute('href')}`,
        };
      }));
    } catch (error) {
      setSuccess(false);
      setLoading(false);
      return Promise.reject(new Error(error));
    }
    setSuccess(true);
    setLoading(false);
  }, [setLoading, setSuccess]);

  useEffect(() => {
    fetchData();
  }, []);

  if(isLoading || !isSuccess) {
    return null;
  }

  return (
    <SimpleBar autoHide={true} style={{height: '100%'}}>
      <h3 style={{maxWidth: '16vw', textOverflow: 'ellipsis', overflow: 'hidden', color: StyleConstants.Colors.greyText}}>VALORANT</h3>
      {matches.map((match: Match, index: number) => {
        return <MatchItem key={index} {...match}/>
      })}
    </SimpleBar>
  );
}

export default ValorantColumn;

const MatchItem = ({teamOne, teamTwo, isLive, time, thumbnail, href}: Match): JSX.Element => {
  return (
    <MediaTile
      thumbnail={thumbnail}
      thumbnailFallbackIcon="fas fa-headset"
      thumbnailHref={href}
      href={href}
      border={false}
      radius="small"
      padding="small"
    >
      <p>
        <strong>{teamOne}</strong>
        {' vs '}
        <strong>{teamTwo}</strong>
      </p>
      <Box padding="none" border={false} style={{color: isLive ? StyleConstants.Colors.redText : StyleConstants.Colors.blueText, display: 'flex', alignItems: 'center'}}>
        <i className={isLive ? 'fas fa-circle' : 'far fa-stopwatch'} style={{marginRight: StyleConstants.Paddings.small, fontSize: isLive ? '0.5rem' : '1rem'}}/>
        <strong>{isLive ? 'LIVE' : time}</strong>
      </Box>
    </MediaTile>
  );
}