import React, { PureComponent } from 'react'
import Modal from '../atoms/Modal'
import { User } from '../../context'
import styles from './WalletSelector.module.scss'
import Button from '../atoms/Button'
import content from '../../data/wallets.json'

export default class WalletSelector extends PureComponent<
    { isWeb3Capable: boolean},
    { isModalOpen: boolean}
> {
    public static contextType = User

    public state = {
        isModalOpen: false
    }

    private handleToggleModal = (e?: Event) => {
        e && e.preventDefault()
        this.setState({ isModalOpen: !this.state.isModalOpen })
    }

    private loginBurnerWallet = () => {
        this.context.loginBurnerWallet()
        this.handleToggleModal()
    }

    private loginMetamask = () => {
        this.context.loginMetamask()
        this.context.logoutBurnerWallet()
        this.handleToggleModal()
    }

    private loginTorus = () => {
        this.context.loginTorus()
        this.context.logoutBurnerWallet()
        this.handleToggleModal()
    }

    private WalletButton = ({
        title,
        description,
        icon
    }: {
        title: string
        description: string
        icon: string
    }) => {
        const active =
            (title === 'Burner Wallet' && this.context.isBurner) ||
            (title === 'MetaMask' && !this.context.isBurner && !this.context.isTorus) ||
            (title === 'Torus' && !this.context.isBurner && this.context.isTorus)
        return (
            <button
                className={active ? styles.buttonActive : styles.button}
                onClick={
                    title === 'MetaMask'
                        ? this.loginMetamask
                        : title === 'Torus' ? this.loginTorus
                        : this.loginBurnerWallet
                }
            >
                <div>
                    <h3 className={styles.buttonTitle}>
                        <span
                            className={styles.buttonIcon}
                            role="img"
                            aria-label={title}
                        >
                            {icon}
                        </span>
                        {title}
                    </h3>
                    <span className={styles.buttonDescription}>
                        {description}
                    </span>
                    {active && (
                        <span className={styles.selected}>Selected</span>
                    )}
                </div>
            </button>
        )
    }

    public render() {
        return (
            <>
                <Button
                    link
                    className={styles.openLink}
                    onClick={this.handleToggleModal}
                    data-action="wallet"
                >
                    {content.title}
                </Button>
                <Modal
                    title={content.title}
                    description={content.description}
                    isOpen={this.state.isModalOpen}
                    toggleModal={this.handleToggleModal}
                >
                    <div className={styles.info}>

                        {content.buttons.map(({ title, description, icon }) => {
                            if (this.props.isWeb3Capable || (!this.props.isWeb3Capable && title !== "MetaMask")) {
                                return <this.WalletButton
                                    key={title}
                                    title={title}
                                    icon={icon}
                                    description={description}
                                />
                            }
                        })}
                    </div>
                </Modal>
            </>
        )
    }
}
