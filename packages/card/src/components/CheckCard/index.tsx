import { useMountMergeState } from '@ant-design/pro-utils';
import { Avatar, ConfigProvider } from 'antd';

import classNames from 'classnames';
import type { MouseEventHandler } from 'react';
import React, { useContext, useEffect, useMemo } from 'react';
import ProCardActions from '../Actions';
import type { CheckCardGroupProps } from './Group';
import CheckCardGroup, { CardLoading, CheckCardGroupConnext } from './Group';
import { useStyle } from './style';
interface CheckCardProps {
  /**
   * 自定义前缀
   *
   * @ignore
   */
  prefixCls?: string;
  /** Change 回调 */
  onChange?: (checked: boolean) => void;
  /** Click 回调 */
  onClick?: (event: MouseEventHandler<HTMLDivElement> | undefined) => void;
  /** 鼠标进入时的回调 */
  onMouseEnter?: MouseEventHandler<HTMLDivElement>;
  /** 鼠标出来时的回调 */
  onMouseLeave?: (event: MouseEventHandler<HTMLDivElement> | undefined) => void;
  /**
   * 默认是否勾选
   *
   * @default false
   * @title 默认勾选
   */
  defaultChecked?: boolean;
  /**
   * 强制勾选
   *
   * @default false
   * @title 强制勾选
   */
  checked?: boolean;
  /**
   * 不可用
   *
   * @default false
   * @title 禁用
   */
  disabled?: boolean;
  /**
   * 选项卡样式
   *
   * @ignore
   */
  style?: React.CSSProperties;
  /**
   * 选项卡 className
   *
   * @ignore
   */
  className?: string;
  /**
   * 左侧头像展示，可以是一个链接也可以是是一个 ReactNode
   *
   * @title 头像
   */
  avatar?: React.ReactNode;
  /**
   * 标题展示
   *
   * @title 标题
   */
  title?: React.ReactNode;
  /**
   * 二级标题展示
   *
   * @title 二级标题
   */
  subTitle?: React.ReactNode;
  /**
   * 描述展示
   *
   * @title 描述
   */
  description?: React.ReactNode;
  /**
   * 选项值
   *
   * @title 值
   */
  value?: any;
  /**
   * 内容是否在加载中
   *
   * @default false
   * @title 加载中
   */
  loading?: boolean;
  /**
   * 图片封面默认，该模式下其他展示值被忽略
   *
   * @title 卡片背景图片
   */
  cover?: React.ReactNode;
  /**
   * 组件尺寸，支持大，中，小三种默认尺寸，用户可以自定义宽高
   *
   * @default default
   * @title 选择框大小
   */
  size?: 'large' | 'default' | 'small';
  /**
   * 是否显示边框
   *
   * @default true
   * @title 显示边框
   */
  bordered?: boolean;
  /**
   * 卡片右上角的操作区域
   *
   * @title 操作栏
   */
  extra?: React.ReactNode;

  children?: React.ReactNode;
  /**
   * 内容区域的样式设计
   */
  bodyStyle?: React.CSSProperties;
  /**
   * 右下角的操作区
   */
  actions?: React.ReactNode[];

  ghost?: boolean;
}

export interface CheckCardState {
  checked: boolean;
}

const CheckCard: React.FC<CheckCardProps> & {
  Group: typeof CheckCardGroup;
} = (props) => {
  const [stateChecked, setStateChecked] = useMountMergeState<boolean>(
    props.defaultChecked || false,
    {
      value: props.checked,
      onChange: props.onChange,
    },
  );
  const checkCardGroup = useContext(CheckCardGroupConnext);
  const { getPrefixCls } = useContext(ConfigProvider.ConfigContext);

  const handleClick = (e: any) => {
    props?.onClick?.(e);
    const newChecked = !stateChecked;
    checkCardGroup?.toggleOption?.({ value: props.value });
    setStateChecked?.(newChecked, e);
  };

  // small => sm large => lg
  const getSizeCls = (size?: string) => {
    if (size === 'large') return 'lg';
    if (size === 'small') return 'sm';
    return '';
  };

  useEffect(() => {
    checkCardGroup?.registerValue?.(props.value);
    return () => checkCardGroup?.cancelValue?.(props.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.value]);

  /**
   * 头像自定义
   *
   * @param prefixCls
   * @param cover
   * @returns
   */
  const renderCover = (prefixCls: string, cover: string | React.ReactNode) => {
    return (
      <div className={`${prefixCls}-cover`}>
        {typeof cover === 'string' ? (
          <img src={cover} alt="checkcard" />
        ) : (
          cover
        )}
      </div>
    );
  };

  const {
    prefixCls: customizePrefixCls,
    className,
    avatar,
    title,
    description,
    cover,
    extra,
    style = {},
    ...others
  } = props;

  const checkCardProps: CheckCardProps = { ...others };
  const prefixCls = getPrefixCls('pro-checkcard', customizePrefixCls);

  const { wrapSSR, hashId } = useStyle(prefixCls);

  checkCardProps.checked = stateChecked;

  let multiple = false;

  if (checkCardGroup) {
    // 受组控制模式
    checkCardProps.disabled = props.disabled || checkCardGroup.disabled;
    checkCardProps.loading = props.loading || checkCardGroup.loading;
    checkCardProps.bordered = props.bordered || checkCardGroup.bordered;

    multiple = checkCardGroup.multiple;

    const isChecked = checkCardGroup.multiple
      ? checkCardGroup.value?.includes(props.value)
      : checkCardGroup.value === props.value;

    // loading时check为false
    checkCardProps.checked = checkCardProps.loading ? false : isChecked;
    checkCardProps.size = props.size || checkCardGroup.size;
  }

  const {
    disabled = false,
    size,
    loading: cardLoading,
    bordered = true,
    checked,
  } = checkCardProps;
  const sizeCls = getSizeCls(size);

  const classString = classNames(prefixCls, className, hashId, {
    [`${prefixCls}-loading`]: cardLoading,
    [`${prefixCls}-${sizeCls}`]: sizeCls,
    [`${prefixCls}-checked`]: checked,
    [`${prefixCls}-multiple`]: multiple,
    [`${prefixCls}-disabled`]: disabled,
    [`${prefixCls}-bordered`]: bordered,
    [`${prefixCls}-ghost`]: props.ghost,
  });

  const metaDom = useMemo(() => {
    if (cardLoading) {
      return <CardLoading prefixCls={prefixCls || ''} />;
    }

    if (cover) {
      return renderCover(prefixCls || '', cover);
    }

    const avatarDom = avatar ? (
      <div className={`${prefixCls}-avatar ${hashId}`.trim()}>
        {typeof avatar === 'string' ? (
          <Avatar size={48} shape="square" src={avatar} />
        ) : (
          avatar
        )}
      </div>
    ) : null;

    const headerDom = (title ?? extra) != null && (
      <div className={`${prefixCls}-header ${hashId}`.trim()}>
        <div className={`${prefixCls}-header-left ${hashId}`.trim()}>
          <div className={`${prefixCls}-title ${hashId}`.trim()}>{title}</div>
          {props.subTitle ? (
            <div className={`${prefixCls}-subTitle ${hashId}`.trim()}>
              {props.subTitle}
            </div>
          ) : null}
        </div>
        {extra && (
          <div className={`${prefixCls}-extra ${hashId}`.trim()}>{extra}</div>
        )}
      </div>
    );

    const descriptionDom = description ? (
      <div className={`${prefixCls}-description ${hashId}`.trim()}>
        {description}
      </div>
    ) : null;

    const metaClass = classNames(`${prefixCls}-content`, hashId, {
      [`${prefixCls}-avatar-header`]: avatarDom && headerDom && !descriptionDom,
    });

    return (
      <div className={metaClass}>
        {avatarDom}
        {headerDom || descriptionDom ? (
          <div className={`${prefixCls}-detail ${hashId}`.trim()}>
            {headerDom}
            {descriptionDom}
          </div>
        ) : null}
      </div>
    );
  }, [
    avatar,
    cardLoading,
    cover,
    description,
    extra,
    hashId,
    prefixCls,
    props.subTitle,
    title,
  ]);

  return wrapSSR(
    <div
      className={classString}
      style={style}
      onClick={(e) => {
        if (!cardLoading && !disabled) {
          handleClick(e);
        }
      }}
      onMouseEnter={props.onMouseEnter}
    >
      {metaDom}
      {props.children ? (
        <div
          className={classNames(`${prefixCls}-body`)}
          style={props.bodyStyle}
        >
          {props.children}
        </div>
      ) : null}
      {props.actions ? (
        <ProCardActions actions={props.actions} prefixCls={prefixCls} />
      ) : null}
    </div>,
  );
};

CheckCard.Group = CheckCardGroup;

export type { CheckCardGroupProps, CheckCardProps };

export default CheckCard;
